"use strict";

const Cron = require("../../src");
const cron = require("cron");

const { ServiceBroker } = require("moleculer");

jest.mock("cron", () => jest.fn());

describe("Test Cron constructor", () => {
	const broker = new ServiceBroker({ logLevel: { "**": "none" } });
	const service = broker.createService(Cron);
	it("should be created", () => {
		expect(service).toBeDefined();
		expect(service.$crons).toBeDefined();
	});

});

describe("Test Cron created handler", () => {
	const broker = new ServiceBroker({ logLevel: { "**": "none" } });

	let cronJob = {};
	cron.CronJob = jest.fn(() => cronJob);

	const nameJob = "Job-Should-Created";

	let cron1 = {
		name: nameJob,
		cronTime: "* * * * *",
		onTick: jest.fn(),
		runOnInit: jest.fn(),
		timeZone: "America/Nipigon"
	};

	const service = broker.createService(
		{
			name: "test-should-be-created",
			mixins: [Cron],
			crons: [
				cron1
			]
		}
	);

	it("should be created $crons", () => {
		expect(service).toBeDefined();
		expect(service.$crons).toBeDefined();
		expect(service.$crons.length).toBe(1);
		expect(service.$crons[0]).toBe(cronJob);
		expect(service.$crons[0].name).toBe(nameJob);
		expect(service.$crons[0].runOnStarted).toBeDefined();
		expect(service.$crons[0].manualStart).toBe(false);

		expect(cron.CronJob).toHaveBeenCalledTimes(1);
	});

});

describe("Test Cron getJob method", () => {
	const broker = new ServiceBroker({ logLevel: { "**": "none" } });

	const service = broker.createService(
		{
			name: "test-should-be-created",
			mixins: [Cron],
			crons: []
		}
	);

	service.$crons = [
		{ name: "job1" },
		{ name: "job2" },
		{ name: "job3" }
	];

	it("should be found job by name", () => {
		expect(service.getJob("job2")).toBe(service.$crons[1]);
	});

});

describe("Test Cron getCronTime method", () => {
	const broker = new ServiceBroker({ logLevel: { "**": "none" } });

	cron.CronTime = jest.fn(() => {});

	const service = broker.createService(
		{
			name: "test-should-be-created",
			mixins: [Cron],
			crons: []
		}
	);

	it("should be call cron.CronTime", () => {
		expect(service.getCronTime(1111)).toEqual({});
		expect(cron.CronTime).toHaveBeenCalledTimes(1);
		expect(cron.CronTime).toHaveBeenCalledWith(1111);
	});

});

describe("Test Cron started handler", () => {
	it("should call start & runOnInit", () => {
		const runOnInitCB = jest.fn();

		let cronJob = {
			start: jest.fn()
		};
		cron.CronJob = jest.fn(() => cronJob);

		const broker = new ServiceBroker({ logLevel: { "**": "none" } });
		broker.createService({
			name: "cron",
			mixins: [Cron],
			crons: [
				{
					runOnInit: runOnInitCB
				}
			]
		});

		return broker.start().then(() => {
			expect(cronJob.start).toHaveBeenCalledTimes(1);
			expect(runOnInitCB).toHaveBeenCalledTimes(1);
		});

	});

	it("should not call start but runOnInit", () => {
		const runOnInitCB = jest.fn();

		let cronJob = {
			start: jest.fn()
		};
		cron.CronJob = jest.fn(() => cronJob);

		const broker = new ServiceBroker({ logLevel: { "**": "none" } });
		broker.createService({
			name: "cron",
			mixins: [Cron],
			crons: [
				{
					manualStart: true,
					runOnInit: runOnInitCB
				}
			]
		});

		return broker.start().then(() => {
			expect(cronJob.start).toHaveBeenCalledTimes(0);
			expect(runOnInitCB).toHaveBeenCalledTimes(1);
		});

	});

});

describe("Test Cron stopped handler", () => {
	const broker = new ServiceBroker({ logLevel: { "**": "none" } });

	it("should call job stop", () => {
		let cronJob = {
			start: jest.fn(),
			stop: jest.fn()
		};
		cron.CronJob = jest.fn(() => cronJob);

		broker.createService({
			name: "cron",
			mixins: [Cron],
			crons: [
				{
					name: "first"
				}
			]
		});

		return broker.start().then(() => broker.stop()).then(() => {
			expect(cronJob.stop).toHaveBeenCalledTimes(1);
		});

	});

});
