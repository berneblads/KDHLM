/**
 * Vercel Speed Insights initialization
 * Tracks web performance metrics for the site
 */
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Speed Insights
// In production, this will automatically track Core Web Vitals
// In development, debug logging is enabled by default
injectSpeedInsights();
