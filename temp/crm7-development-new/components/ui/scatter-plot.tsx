'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  x: number;
  y: number;
  confidence?: number;
}

interface ScatterPlotProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export function ScatterPlot({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
}: ScatterPlotProps): JSX.Element {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return undefined;

    // Clear existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Create scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.x) ?? 0])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y) ?? 0])
      .range([height - margin.bottom, margin.top]);

    // Create SVG
    const svg = d3.select(svgRef.current);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Add points
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '5px')
      .style('border-radius', '3px');

    svg.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 3)
      .attr('fill', 'steelblue')
      .on('mouseover', function(event, d) {
        d3.select(this).transition().duration(200).attr('r', 6);
        tooltip
          .style('visibility', 'visible')
          .html(`
            x: ${d.x}<br/>
            y: ${d.y}<br/>
            ${d.confidence ? `Confidence: ${(d.confidence * 100).toFixed(1)}%` : ''}
          `);
      })
      .on('mousemove', (event): void => {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).attr('r', 3);
        tooltip.style('visibility', 'hidden');
      });

    // Return cleanup function
    return (): void => {
      tooltip.remove();
    };
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
