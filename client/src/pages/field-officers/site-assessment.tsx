import { useState } from 'react';
import { useLocation } from 'wouter';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, Plus, Upload } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface CorrectiveAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
}

/**
 * Site Assessment Form Component
 */
export default function SiteAssessmentPage() {
  const [_, navigate] = useLocation();
  // State for safety checklist items
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: '1', label: 'PPE provided', checked: true },
    { id: '2', label: 'Fire exits clear', checked: true },
    { id: '3', label: 'Hazard signage', checked: false },
    { id: '4', label: 'Machinery guards', checked: true },
    { id: '5', label: 'First aid kit', checked: true },
    { id: '6', label: 'Electrical tags', checked: false },
  ]);

  // State for WHS rating
  const [whsRating, setWhsRating] = useState('green');

  // State for corrective actions
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([
    {
      id: '1',
      description: 'Replace missing signage',
      assignedTo: 'host',
      dueDate: '2025-05-20',
      completed: false,
    },
    {
      id: '2',
      description: 'Service fire extinguishers',
      assignedTo: 'safety-officer',
      dueDate: '2025-05-15',
      completed: false,
    },
  ]);

  // State for host feedback
  const [hostFeedback, setHostFeedback] = useState(
    'Site very well maintained, apprentice John adjusting well to the workplace environment. Some minor safety issues to address but overall good compliance.'
  );

  // Toggle checklist item
  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Toggle corrective action completion
  const toggleCorrectiveAction = (id: string) => {
    setCorrectiveActions(prev =>
      prev.map(action => (action.id === id ? { ...action, completed: !action.completed } : action))
    );
  };

  // Add new checklist item
  const addChecklistItem = () => {
    const newId = (checklistItems.length + 1).toString();
    setChecklistItems([...checklistItems, { id: newId, label: '', checked: false }]);
  };

  // Add new corrective action
  const addCorrectiveAction = () => {
    const newId = (correctiveActions.length + 1).toString();
    setCorrectiveActions([
      ...correctiveActions,
      {
        id: newId,
        description: '',
        assignedTo: '',
        dueDate: '',
        completed: false,
      },
    ]);
  };

  return (
    <PageLayout
      title="Site Assessment"
      description="Complete safety and compliance assessment for host employer sites"
      showBackButton
      backUrl="/field-officers"
      actions={<Button className="ml-auto">Save Assessment</Button>}
    >
      <div className="space-y-6">
        {/* Visit Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visit">Select Visit</Label>
                  <Select defaultValue="visit-3">
                    <SelectTrigger id="visit">
                      <SelectValue placeholder="Select a visit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visit-1">#1 - 2025-05-02 / Acme Constructions</SelectItem>
                      <SelectItem value="visit-2">#2 - 2025-05-04 / SteelWorks Pty Ltd</SelectItem>
                      <SelectItem value="visit-3">#3 - 2025-05-10 / Acme Constructions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessment-date">Assessment Date</Label>
                  <div className="flex items-center space-x-2">
                    <Input id="assessment-date" type="date" defaultValue="2025-05-10" />
                    <Button size="icon" variant="outline">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Safety Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checklistItems.map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={item.checked}
                    onCheckedChange={() => toggleChecklistItem(item.id)}
                  />
                  <Label htmlFor={`item-${item.id}`} className="text-sm">
                    {item.label}
                  </Label>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={addChecklistItem}
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WHS Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">WHS Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={whsRating}
              onValueChange={setWhsRating}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="green" id="rating-green" />
                <Label htmlFor="rating-green" className="text-green-600 font-semibold">
                  Green
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="amber" id="rating-amber" />
                <Label htmlFor="rating-amber" className="text-amber-600 font-semibold">
                  Amber
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="red" id="rating-red" />
                <Label htmlFor="rating-red" className="text-red-600 font-semibold">
                  Red
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Corrective Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Corrective Actions</CardTitle>
            <Button size="sm" variant="outline" onClick={addCorrectiveAction}>
              <Plus className="h-4 w-4 mr-1" />
              Add Action
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {correctiveActions.map(action => (
                <div key={action.id} className="flex items-center gap-3 border-b pb-3">
                  <Checkbox
                    id={`action-${action.id}`}
                    checked={action.completed}
                    onCheckedChange={() => toggleCorrectiveAction(action.id)}
                  />
                  <div className="grid gap-1 flex-1">
                    <Label
                      htmlFor={`action-${action.id}`}
                      className={action.completed ? 'line-through text-muted-foreground' : ''}
                    >
                      {action.description}
                    </Label>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Assigned: {action.assignedTo}</span>
                      <span>Due: {action.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Host Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Host Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={hostFeedback}
              onChange={e => setHostFeedback(e.target.value)}
              rows={4}
              placeholder="Enter host employer feedback..."
            />
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Documents
                </Button>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Photos
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                No attachments yet. Upload documents or photos related to this site assessment.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => navigate('/field-officers')}>
            Cancel
          </Button>
          <Button>Save Assessment</Button>
        </div>
      </div>
    </PageLayout>
  );
}
