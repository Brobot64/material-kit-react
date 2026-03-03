import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { _tasks } from 'src/_mock';
import { api } from 'src/services/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const fetchPromises: Promise<any>[] = [
          api.getSalesAnalytics(),
          api.getCategoryPerformance({ year: new Date().getFullYear() }),
          api.getAuditLogs({ limit: 5 }),
        ];

        const [salesData, categoryData, logsData] = await Promise.all(fetchPromises);

        setAnalytics(salesData);
        setCategoryPerformance(categoryData);
        if (logsData) {
          setAuditLogs(logsData.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  const calculatePercent = (data: any[], key: string) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const weeklyCountPercent = analytics ? calculatePercent(analytics.last4Weeks, 'count') : 0;
  const weeklySalesPercent = analytics ? calculatePercent(analytics.last4Weeks, 'totalAmount') : 0;
  const monthlyCountPercent = analytics ? calculatePercent(analytics.last4Months, 'count') : 0;
  const monthlySalesPercent = analytics
    ? calculatePercent(analytics.last4Months, 'totalAmount')
    : 0;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Weekly count"
            percent={weeklyCountPercent}
            total={analytics?.currentWeek?.count || 0}
            icon={<img alt="Weekly count" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: analytics?.last4Weeks?.map((item: any) => item.group) || [],
              series: analytics?.last4Weeks?.map((item: any) => item.count) || [],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Weekly sales"
            percent={weeklySalesPercent}
            total={analytics?.currentWeek?.totalAmount || 0}
            color="secondary"
            icon={<img alt="Weekly sales" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: analytics?.last4Weeks?.map((item: any) => item.group) || [],
              series: analytics?.last4Weeks?.map((item: any) => item.totalAmount) || [],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Monthly count"
            percent={monthlyCountPercent}
            total={analytics?.currentMonth?.count || 0}
            color="warning"
            icon={<img alt="Monthly count" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: analytics?.last4Months?.map((item: any) => item.group) || [],
              series: analytics?.last4Months?.map((item: any) => item.count) || [],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Monthly sales"
            percent={monthlySalesPercent}
            total={analytics?.currentMonth?.totalAmount || 0}
            color="error"
            icon={<img alt="Monthly sales" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: analytics?.last4Months?.map((item: any) => item.group) || [],
              series: analytics?.last4Months?.map((item: any) => item.totalAmount) || [],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Category performance"
            chart={{
              series: categoryPerformance.map((item) => ({
                label: item.label,
                value: item.value,
              })),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Monthly sales"
            subheader="Performance over the last 4 months"
            chart={{
              categories: analytics?.last4Months?.map((item: any) => item.group) || [],
              series: [
                {
                  name: 'Total Amount',
                  data: analytics?.last4Months?.map((item: any) => item.totalAmount) || [],
                },
                {
                  name: 'Transaction Count',
                  data: analytics?.last4Months?.map((item: any) => item.count) || [],
                },
              ],
            }}
          />
        </Grid>

        {/* <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="Conversion rates"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Italy', 'Japan', 'China', 'Canada', 'France'],
              series: [
                { name: '2022', data: [44, 55, 41, 64, 22] },
                { name: '2023', data: [53, 32, 33, 52, 13] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentSubject
            title="Current subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsNews title="News" list={_posts.slice(0, 5)} />
        </Grid> */}

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsTasks title="Tasks" list={_tasks} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsOrderTimeline
            title="Audit logs"
            list={auditLogs.map((log) => ({
              id: log._id,
              title: log.description || log.action,
              performer: log.actionBy?.name || 'System',
              type: log.action.includes('CREATE')
                ? 'order1'
                : log.action.includes('ADD')
                  ? 'order2'
                  : log.action.includes('UPDATE')
                    ? 'order3'
                    : log.action.includes('DELETE')
                      ? 'order4'
                      : 'order5',
              time: log.createdAt,
            }))}
          />
        </Grid>

        {/* <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsTrafficBySite title="Traffic by site" list={_traffic} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsTasks title="Tasks" list={_tasks} />
        </Grid> */}
      </Grid>
    </DashboardContent>
  );
}
