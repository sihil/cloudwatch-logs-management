import type { CloudWatchLogsClientConfig } from '@aws-sdk/client-cloudwatch-logs';
import type { ECSClientConfig } from '@aws-sdk/client-ecs';
import type { KinesisClientConfig } from '@aws-sdk/client-kinesis';
import type { LambdaClientConfig } from '@aws-sdk/client-lambda';
import type { S3ClientConfig } from '@aws-sdk/client-s3';

type CommonAWSConfig = Pick<
	S3ClientConfig,
	keyof KinesisClientConfig &
		keyof ECSClientConfig &
		keyof CloudWatchLogsClientConfig &
		keyof LambdaClientConfig
>;

interface CommonConfig {
	awsConfig: CommonAWSConfig;
}

interface SetRetentionConfig {
	retentionInDays: number;
}

interface StructuredDataConfig {
	structuredDataBucket: string;
	structuredDataKey: string;
}

interface ConfigureLogShippingConfig extends StructuredDataConfig {
	logNamePrefixes: string[];
	logShippingFilterName: string;
	logShippingLambdaArn: string;
}

interface ShipLogsConfig extends StructuredDataConfig {
	kinesisStreamName: string;
}

function getRequiredEnv(key: string, devDefault?: string): string {
	const value = process.env[key];

	// happy path
	if (value) {
		return value;
	}

	const stage = process.env['STAGE'] ?? 'DEV';
	const shouldUseDevDefault = stage === 'DEV';

	// happy path, when in DEV
	if (devDefault && shouldUseDevDefault) {
		return devDefault;
	}

	// unhappy path
	throw new Error(`Missing ENV var ${key}`);
}

export function getCommonConfig(): CommonConfig {
	const region = getRequiredEnv('AWS_REGION');
	const maxAttempts = 10;
	return {
		awsConfig: {
			region,
			maxAttempts,
		},
	};
}

export function getSetRetentionConfig(): SetRetentionConfig {
	const retentionInDays = parseInt(getRequiredEnv('RETENTION_IN_DAYS', '14'));
	return {
		retentionInDays,
	};
}

export function getConfigureLogShippingConfig(): ConfigureLogShippingConfig {
	const logNamePrefixes = getRequiredEnv('LOG_NAME_PREFIXES', '')
		.split(',')
		.filter((prefix) => prefix.length !== 0);
	const logShippingLambdaArn = getRequiredEnv('LOG_SHIPPING_LAMBDA_ARN');
	const structuredDataBucket = getRequiredEnv('STRUCTURED_DATA_BUCKET');

	return {
		logNamePrefixes,
		logShippingFilterName: 'GuLogShippingLambdaFilter',
		logShippingLambdaArn,
		structuredDataBucket,
		structuredDataKey: 'structured-data.json',
	};
}

export function getShipLogsConfig(): ShipLogsConfig {
	const kinesisStream = getRequiredEnv('LOG_KINESIS_STREAM');
	const structuredDataBucket = getRequiredEnv('STRUCTURED_DATA_BUCKET');
	const kinesisStreamName = kinesisStream.includes('/')
		? kinesisStream.split('/')[1]
		: kinesisStream;

	return {
		kinesisStreamName,
		structuredDataBucket,
		structuredDataKey: 'structured-data.json',
	};
}
