"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatEUR } from "@/lib/pricing";

export type DailyRevenue = { day: string; amountCents: number };

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DailyRevenue }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="text-muted-foreground">{new Date(point.day).toLocaleDateString()}</p>
      <p className="font-semibold text-popover-foreground">{formatEUR(point.amountCents / 100)}</p>
    </div>
  );
}

export function EarningsChart({ data }: { data: DailyRevenue[] }) {
  return (
    <Tabs defaultValue="chart">
      <TabsList>
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
      </TabsList>
      <TabsContent value="chart">
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No revenue recorded yet.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tickFormatter={(v: number) => formatEUR(v / 100)}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip content={<TooltipContent />} cursor={{ stroke: "var(--acc)", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="amountCents"
                  stroke="var(--acc)"
                  strokeWidth={2}
                  fill="var(--acc)"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </TabsContent>
      <TabsContent value="table">
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No revenue recorded yet.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((d) => (
                  <TableRow key={d.day}>
                    <TableCell>{new Date(d.day).toLocaleDateString()}</TableCell>
                    <TableCell>{formatEUR(d.amountCents / 100)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
