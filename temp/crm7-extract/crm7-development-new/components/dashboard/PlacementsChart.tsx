import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function PlacementsChart(): JSX.Element {
  return (
    <div>
      {/* Implement chart here */}
      <p>Placements chart coming soon</p>
    </div>
  );
}
