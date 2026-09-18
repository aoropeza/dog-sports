import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface DynamoTableProps {
  readonly tableName: string;
  readonly partitionKey: cdk.aws_dynamodb.Attribute;
  readonly sortKey?: cdk.aws_dynamodb.Attribute;
  /** Keep the table when the stack is destroyed (user data) instead of deleting it. */
  readonly retain?: boolean;
  readonly pointInTimeRecovery?: boolean;
}

// On-demand DynamoDB table — no capacity to size, pay only for usage.
export class DynamoTable extends Construct {
  readonly table: cdk.aws_dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoTableProps) {
    super(scope, id);

    this.table = new cdk.aws_dynamodb.Table(this, "Table", {
      tableName: props.tableName,
      partitionKey: props.partitionKey,
      sortKey: props.sortKey,
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: props.retain ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: props.pointInTimeRecovery ?? false },
    });

    new cdk.CfnOutput(this, "TableName", { value: this.table.tableName });
  }
}
