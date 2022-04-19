/*
 * moleculer-cron
 */

"use strict";

const cron = require("cron");
const { v4: uuid } = require("uuid");

/**
	cronOpts
	[
		{
			cronTime,
			onTick,
			onComplete,
			start,
			timezone,
			manualStart,
			runOnInit
		}
	]
*/

/**
*  Mixin service for Cron
*
* @name moleculer-cron
* @module Service
*/
module.exports = {
	name: "cron",

	/**
	 * Methods
	 */
	methods: {

		/**
		 * Find a job by name
		 * 
		 * @param {String} name 
		 * @returns {CronJob}
		 */
		getJob(name) {
			return this.$crons.find((job) => job?.name === name);
		},

		/**
		 * Get a Cron time
		 * @param {String} time 
		 */
		getCronTime(time) {
			return new cron.CronTime(time);
		}
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		this.$crons = [];

		if (this.schema.crons) {
			this.$crons = this.schema.crons.map((job) => {
				//	Prevent error on runOnInit that handle onTick at the end of the constructor
				//	We handle it ourself
				const cacheFunction = job.runOnInit;
				job.runOnInit = undefined;
				//	Just add the broker to handle actions and methods from other services
				const instance_job = new cron.CronJob(
					Object.assign(
						job,
						{
							context: Object.assign(
								this.broker,
								{
									getJob: this.getJob
								}
							)
						}
					)
				);
				instance_job.runOnStarted = cacheFunction;
				instance_job.manualStart = job.manualStart || false;
				instance_job.name = job.name || uuid();
				
				return instance_job;
			});
		}

		return Promise.resolve();
	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {
		this.$crons.map((job) => {
			if (!job.manualStart) {
				job.start();
			}
			this.logger.info("Start Cron - ", job.name);
			if (job.runOnStarted) {
				job.runOnStarted();
			}
		});
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {
		this.$crons.map((job) => {
			job.stop();
		});
	}
};
