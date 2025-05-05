// Utility functions for progress reviews

/**
 * Get status badge color based on review status
 */
export function getStatusColor(status: string) {
  switch (status) {
    case 'scheduled':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: 'text-blue-500',
      };
    case 'in_progress':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        icon: 'text-amber-500',
      };
    case 'completed':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: 'text-green-500',
      };
    case 'cancelled':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: 'text-red-500',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: 'text-gray-500',
      };
  }
}

/**
 * Get priority badge color based on action item priority
 */
export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'low':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
      };
    case 'medium':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
      };
    case 'high':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
      };
    case 'critical':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
      };
  }
}

/**
 * Format rating to stars (★)
 */
export function formatRating(rating: number): string {
  if (!rating || rating < 1) return 'Not rated';
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

/**
 * Get color class for rating
 */
export function getRatingColor(rating: number): string {
  if (!rating || rating < 1) return 'text-gray-400';
  if (rating <= 2) return 'text-red-500';
  if (rating === 3) return 'text-amber-500';
  if (rating >= 4) return 'text-green-500';
  return 'text-gray-500';
}

/**
 * Get default form structure for new templates
 */
export function getDefaultFormStructure() {
  return {
    sections: [
      {
        title: 'Apprentice Performance',
        description: 'Evaluate the apprentice\'s performance in various key areas',
        questions: [
          {
            id: 'technical_skills',
            type: 'rating',
            label: 'Technical Skills',
            description: 'Ability to apply technical knowledge in practice',
            required: true,
          },
          {
            id: 'communication',
            type: 'rating',
            label: 'Communication Skills',
            description: 'Ability to communicate effectively with team and stakeholders',
            required: true,
          },
          {
            id: 'teamwork',
            type: 'rating',
            label: 'Teamwork',
            description: 'Ability to work collaboratively with others',
            required: true,
          },
          {
            id: 'initiative',
            type: 'rating',
            label: 'Initiative & Problem-Solving',
            description: 'Ability to identify issues and take initiative',
            required: true,
          },
          {
            id: 'reliability',
            type: 'rating',
            label: 'Reliability',
            description: 'Punctuality, attendance, and task completion',
            required: true,
          },
          {
            id: 'details',
            type: 'textarea',
            label: 'Performance Details',
            description: 'Provide specific examples and feedback about performance',
            required: false,
          },
        ],
      },
      {
        title: 'Progress on Training Requirements',
        description: 'Assessment of progress towards qualification requirements',
        questions: [
          {
            id: 'training_progress',
            type: 'rating',
            label: 'Progress in Training',
            description: 'Overall progress towards completing training requirements',
            required: true,
          },
          {
            id: 'training_details',
            type: 'textarea',
            label: 'Training Progress Details',
            description: 'Details about units completed and areas requiring attention',
            required: false,
          },
        ],
      },
      {
        title: 'Workplace Integration',
        description: 'Assess how well the apprentice has integrated into the workplace',
        questions: [
          {
            id: 'workplace_integration',
            type: 'rating',
            label: 'Workplace Integration',
            description: 'How well the apprentice has adapted to the workplace environment',
            required: true,
          },
          {
            id: 'supervisor_feedback',
            type: 'textarea',
            label: 'Supervisor Feedback',
            description: 'Feedback provided by the workplace supervisor',
            required: false,
          },
        ],
      },
      {
        title: 'Goals and Improvement',
        description: 'Set goals for the next review period',
        questions: [
          {
            id: 'strengths',
            type: 'textarea',
            label: 'Key Strengths',
            description: 'Identify the apprentice\'s key strengths',
            required: true,
          },
          {
            id: 'improvement_areas',
            type: 'textarea',
            label: 'Areas for Improvement',
            description: 'Identify areas where the apprentice needs to improve',
            required: true,
          },
          {
            id: 'goals',
            type: 'textarea',
            label: 'Goals for Next Period',
            description: 'Specific goals to be achieved before the next review',
            required: true,
          },
        ],
      },
    ],
  };
}
