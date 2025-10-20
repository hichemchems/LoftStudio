const cron = require('node-cron');
const StatsService = require('./statsService');

class StatsScheduler {
  constructor() {
    this.dailyJob = null;
    this.weeklyJob = null;
  }

  /**
   * Start the scheduler
   */
  start() {
    console.log('Starting stats scheduler...');

    // Daily reset at 00:00:00 every day
    this.dailyJob = cron.schedule('0 0 * * *', async () => {
      console.log('Running daily stats update...');
      try {
        await StatsService.updateDailyStats();
        console.log('Daily stats update completed successfully');
      } catch (error) {
        console.error('Error in daily stats update:', error);
      }
    }, {
      scheduled: false // Don't start immediately
    });

    // Weekly reset at 00:00:00 every Sunday
    this.weeklyJob = cron.schedule('0 0 * * 0', async () => {
      console.log('Running weekly stats update...');
      try {
        await StatsService.updateWeeklyStats();
        console.log('Weekly stats update completed successfully');
      } catch (error) {
        console.error('Error in weekly stats update:', error);
      }
    }, {
      scheduled: false // Don't start immediately
    });

    // Start the jobs
    this.dailyJob.start();
    this.weeklyJob.start();

    console.log('Stats scheduler started successfully');
    console.log('- Daily reset: Every day at 00:00:00');
    console.log('- Weekly reset: Every Sunday at 00:00:00');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.dailyJob) {
      this.dailyJob.stop();
      console.log('Daily stats job stopped');
    }

    if (this.weeklyJob) {
      this.weeklyJob.stop();
      console.log('Weekly stats job stopped');
    }

    console.log('Stats scheduler stopped');
  }

  /**
   * Manually trigger daily update (for testing)
   */
  async triggerDailyUpdate() {
    console.log('Manually triggering daily stats update...');
    try {
      await StatsService.updateDailyStats();
      console.log('Manual daily stats update completed');
    } catch (error) {
      console.error('Error in manual daily stats update:', error);
      throw error;
    }
  }

  /**
   * Manually trigger weekly update (for testing)
   */
  async triggerWeeklyUpdate() {
    console.log('Manually triggering weekly stats update...');
    try {
      await StatsService.updateWeeklyStats();
      console.log('Manual weekly stats update completed');
    } catch (error) {
      console.error('Error in manual weekly stats update:', error);
      throw error;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      dailyJobRunning: this.dailyJob ? this.dailyJob.running : false,
      weeklyJobRunning: this.weeklyJob ? this.weeklyJob.running : false,
      nextDailyRun: this.dailyJob ? this.dailyJob.nextRun : null,
      nextWeeklyRun: this.weeklyJob ? this.weeklyJob.nextRun : null
    };
  }
}

module.exports = StatsScheduler;
