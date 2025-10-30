'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter, Calendar } from 'lucide-react';

interface MemoryFiltersProps {
  selectedType: string;
  selectedPriority: string;
  onTypeChange: (type: string) => void;
  onPriorityChange: (priority: string) => void;
  onClearFilters?: () => void;
}

const memoryTypes = [
  { value: 'all', label: 'All Types', icon: '📝' },
  { value: 'note', label: 'Notes', icon: '📝' },
  { value: 'insight', label: 'Insights', icon: '💡' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'reference', label: 'Reference', icon: '🎯' },
  { value: 'quote', label: 'Quotes', icon: '💬' },
  { value: 'idea', label: 'Ideas', icon: '⭐' },
];

const priorityLevels = [
  { value: 'all', label: 'All Priorities', color: 'bg-gray-100 text-gray-800' },
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export function MemoryFilters({ 
  selectedType, 
  selectedPriority, 
  onTypeChange, 
  onPriorityChange,
  onClearFilters 
}: MemoryFiltersProps) {
  const hasActiveFilters = selectedType !== 'all' || selectedPriority !== 'all';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onTypeChange('all');
                onPriorityChange('all');
                onClearFilters?.();
              }}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Memory Type Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Memory Type</label>
            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {memoryTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select value={selectedPriority} onValueChange={onPriorityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityLevels.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                      <span>{priority.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {memoryTypes.find(t => t.value === selectedType)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => onTypeChange('all')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
              {selectedPriority !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {priorityLevels.find(p => p.value === selectedPriority)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => onPriorityChange('all')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}