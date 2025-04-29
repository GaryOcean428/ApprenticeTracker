import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface BarChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export function BarChart({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 30, left: 40 }
}: BarChartProps): JSX.Element {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create SVG
    const svg = d3.select(svgRef.current);

    // Add bars
    svg.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.label) ?? 0)
      .attr('y', d => y(d.value))
      .attr('height', d => y(0) - y(d.value))
      .attr('width', x.bandwidth())
      .attr('fill', 'steelblue');

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [data, width, height, margin]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="overflow-visible"
    />
  );
}
