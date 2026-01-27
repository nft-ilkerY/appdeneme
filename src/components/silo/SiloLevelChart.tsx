import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SiloLevelChartProps {
  data: Array<{
    recorded_at: string;
    level_percent: number;
    level_tons: number | null;
  }>;
}

export default function SiloLevelChart({ data }: SiloLevelChartProps) {
  const chartData = data.map((item) => ({
    time: format(new Date(item.recorded_at), 'dd MMM HH:mm', { locale: tr }),
    fullTime: format(new Date(item.recorded_at), 'dd MMMM yyyy HH:mm', {
      locale: tr,
    }),
    level: parseFloat(item.level_percent.toFixed(1)),
    tons: item.level_tons ? parseFloat(item.level_tons.toFixed(1)) : null,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
            label={{
              value: 'Seviye (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#6b7280' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
            formatter={(value: number, name: string) => [
              name === 'level' ? `${value}%` : `${value} ton`,
              name === 'level' ? 'Seviye' : 'Ton',
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullTime;
              }
              return label;
            }}
          />

          {/* Warning Lines */}
          <ReferenceLine
            y={80}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{
              value: 'Kritik',
              position: 'right',
              fill: '#ef4444',
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={60}
            stroke="#f97316"
            strokeDasharray="3 3"
            label={{
              value: 'Yüksek',
              position: 'right',
              fill: '#f97316',
              fontSize: 10,
            }}
          />

          <Line
            type="monotone"
            dataKey="level"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
