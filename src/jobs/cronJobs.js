import cron from 'node-cron';
import projectRepository from '../repositories/projectRepository.js';
import budgetRepository from '../repositories/budgetRepository.js';
import expenseRepository from '../repositories/expenseRepository.js';
import incidentRepository from '../repositories/incidentRepository.js';
import aiInsightRepository from '../repositories/aiInsightRepository.js';
import logger from '../config/logger.js';

// Run weekly project data audits: every Sunday at 00:00 (midnight)
const scheduleWeeklyAudit = () => {
  cron.schedule('0 0 * * 0', async () => {
    logger.info('[Cron Job] Executing weekly database operations health audit...');
    try {
      // Fetch all projects (we can scan active projects via repository)
      const projectsResult = await projectRepository.findAll({ limit: 100 });
      const projects = projectsResult.data;

      for (const project of projects) {
        // 1. Calculate spending statistics
        const budgets = await budgetRepository.findByProject(project._id);
        const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
        const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
        const spendRatio = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

        // 2. Count active incidents
        const incidentsResult = await incidentRepository.findByProject(project._id, {
          filter: { status: 'reported' },
          limit: 1
        });
        const pendingIncidentCount = incidentsResult.total;

        // 3. Compile AI Insight Summary
        let summary = `Weekly financial audit: Project '${project.name}' is within budget bounds at ${spendRatio.toFixed(1)}% spending.`;
        const recommendations = ['Continue tracking daily site material consumption ledger details.'];

        if (spendRatio > 90) {
          summary += ' Warning: Category spend levels are near allocation limits.';
          recommendations.push('Review miscellaneous expense category allocations immediately.');
        }

        if (pendingIncidentCount > 0) {
          summary += ` Active hazard warning: ${pendingIncidentCount} reported safety incidents are pending investigation.`;
          recommendations.push('Execute site safety reviews to address active hazard zones.');
        }

        // Save AI health forecast audit insight
        await aiInsightRepository.create({
          projectId: project._id,
          date: new Date(),
          type: 'financial_forecast',
          summary,
          recommendations,
          confidenceScore: 0.90
        });

        logger.info(`[Cron Job] Weekly AI summary forecast saved for project: ${project.name}`);
      }
    } catch (error) {
      logger.error(`[Cron Job] Weekly audit execution failed: ${error.message}`);
    }
  });

  logger.info('[Cron] Weekly operations audit scheduled (Sunday 00:00)');
};

export {
  scheduleWeeklyAudit
};
export default { scheduleWeeklyAudit };
