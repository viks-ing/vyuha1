import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockAnalysisHistory } from '../data/mockData';
import { formatINR } from '../lib/utils';
import { History as HistoryIcon, Search, Eye, Filter, Download } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export const History: React.FC = () => {
  const { showToast } = useCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredHistory = mockAnalysisHistory.filter((item) => {
    const matchesSearch =
      item.analysisName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.primaryScenario.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>Audit Trail & Historical Benchmarks</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Analysis History</h2>
          <p className="text-sm text-slate-400">
            Review past risk projections, scenario runs, and historical supply chain vulnerability scores.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => showToast('Exporting history report to CSV...')}>
          <Download className="w-4 h-4 mr-2" /> Export History
        </Button>
      </div>

      {/* Filter and Search Toolbar Card */}
      <Card className="border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search analysis name or scenario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'High', label: 'High Risk' },
                  { value: 'Medium', label: 'Medium Risk' },
                  { value: 'Low', label: 'Low Risk' },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Display Card */}
      <Card className="border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Analysis Run</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Expected Delay</TableHead>
                <TableHead>Expected Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    No matching analysis records found. Try adjusting your search query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-100 text-sm">{item.analysisName}</p>
                        <p className="text-xs text-slate-400">{item.primaryScenario}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 font-medium">{item.date}</TableCell>
                    <TableCell>
                      <span className="font-extrabold text-amber-400 text-sm">{item.riskScore}</span>
                      <span className="text-[10px] text-slate-500"> /100</span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 font-medium">{item.expectedDelayDays} Days</TableCell>
                    <TableCell className="text-xs text-slate-300 font-medium">{formatINR(item.expectedCost)}</TableCell>
                    <TableCell>
                      <Badge variant={item.status as any}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showToast(`Viewing summary for ${item.analysisName}`)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
