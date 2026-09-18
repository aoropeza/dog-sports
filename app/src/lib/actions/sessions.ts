"use server";

import { randomUUID } from "crypto";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { fromIni } from "@aws-sdk/credential-providers";
import type { CreateSessionInput, TrainingSession } from "@/types/session";

// In AWS the Lambda role supplies credentials. Locally (`MACHINE=local`, set in
// .env.local) use a named profile from ~/.aws/credentials, like citius does.
const getDynamoClientConfig = () =>
  process.env.MACHINE === "local"
    ? {
        credentials: fromIni({ profile: process.env.AWS_PROFILE_NAME ?? "dogsports" }),
        region: process.env.AWS_REGION ?? "us-east-1",
      }
    : {};

const client = new DynamoDBClient(getDynamoClientConfig());
const TABLE_NAME = `training-sessions-${process.env.STAGE}`;

const toSession = (item: Record<string, never>): TrainingSession => unmarshall(item) as TrainingSession;

async function readSession(id: string): Promise<TrainingSession | null> {
  const { Item } = await client.send(new GetItemCommand({ TableName: TABLE_NAME, Key: marshall({ id }) }));
  return Item ? toSession(Item as Record<string, never>) : null;
}

async function requireSession(id: string): Promise<TrainingSession> {
  const session = await readSession(id);
  if (!session) throw new Error(`Sesión ${id} no existe`);
  return session;
}

async function setList(id: string, field: "exerciseIds" | "completedIds", values: string[]) {
  await client.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ id }),
      ConditionExpression: "attribute_exists(id)",
      UpdateExpression: "SET #f = :v",
      ExpressionAttributeNames: { "#f": field },
      ExpressionAttributeValues: marshall({ ":v": values }),
    }),
  );
}

export async function listSessions(): Promise<TrainingSession[]> {
  const sessions: TrainingSession[] = [];
  let startKey: Record<string, never> | undefined;
  do {
    const page = await client.send(new ScanCommand({ TableName: TABLE_NAME, ExclusiveStartKey: startKey }));
    sessions.push(...(page.Items ?? []).map((i) => toSession(i as Record<string, never>)));
    startKey = page.LastEvaluatedKey as Record<string, never> | undefined;
  } while (startKey);
  // Newest training first; createdAt breaks ties between same-day sessions.
  return sessions.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export async function getSession(id: string): Promise<TrainingSession | null> {
  return readSession(id);
}

export async function createSession(input: CreateSessionInput): Promise<TrainingSession> {
  const session: TrainingSession = {
    id: randomUUID(),
    name: input.name.trim() || "Entrenamiento",
    date: input.date,
    exerciseIds: [...new Set(input.exerciseIds)],
    completedIds: [],
    createdAt: new Date().toISOString(),
  };
  await client.send(new PutItemCommand({ TableName: TABLE_NAME, Item: marshall(session) }));
  return session;
}

export async function addExercisesToSession(id: string, exerciseIds: string[]): Promise<void> {
  const session = await requireSession(id);
  await setList(id, "exerciseIds", [...new Set([...session.exerciseIds, ...exerciseIds])]);
}

export async function removeExerciseFromSession(id: string, exerciseId: string): Promise<void> {
  const session = await requireSession(id);
  await setList(
    id,
    "exerciseIds",
    session.exerciseIds.filter((e) => e !== exerciseId),
  );
  await setList(
    id,
    "completedIds",
    session.completedIds.filter((e) => e !== exerciseId),
  );
}

export async function setExerciseDone(id: string, exerciseId: string, done: boolean): Promise<void> {
  const session = await requireSession(id);
  const rest = session.completedIds.filter((e) => e !== exerciseId);
  await setList(id, "completedIds", done ? [...rest, exerciseId] : rest);
}

export async function deleteSession(id: string): Promise<void> {
  await client.send(new DeleteItemCommand({ TableName: TABLE_NAME, Key: marshall({ id }) }));
}
