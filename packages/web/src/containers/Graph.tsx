import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import ForceGraph2D from "react-force-graph-2d";
import styles from "./Graph.module.scss";

// https://medium.com/@jeffbutsch/using-d3-in-react-with-hooks-4a6c61f1d102
export function Graph({ data }) {
  const d3Container = useRef(null);

  useEffect(() => {
    if (data && d3Container.current) {
      const svg = d3.select(d3Container.current);

      // Bind D3 data
      const update = svg.append("g").selectAll("text").data(data);

      // Enter new D3 elements
      update
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 25)
        .attr("y", 40)
        .style("font-size", 24)
        .text((d: number) => d);

      // Update existing D3 elements
      update.attr("x", (d, i) => i * 40).text((d: number) => d);

      // Remove old D3 elements
      update.exit().remove();
    }
  }, [data, d3Container.current]);

  return (
    <svg className="d3-component" width={400} height={200} ref={d3Container} />
  );
}

// https://github.com/vasturiano/react-force-graph/blob/master/example/text-nodes/index-2d.html
export default function Section() {
  return (
    <section className={styles.Section}>
      <h2>Graph</h2>
      {/* <Graph data={[1, 2, 3]} /> */}
      <ForceGraph2D
        graphData={require("../assets/datasets/miserables.json")}
        nodeAutoColorBy="group"
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.id;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(
            (n) => n + fontSize * 0.2
          ); // some padding

          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = node.color;
          ctx.fillText(label, node.x, node.y);

          node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          const bckgDimensions = node.__bckgDimensions;
          bckgDimensions &&
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y - bckgDimensions[1] / 2,
              ...bckgDimensions
            );
        }}
      />
    </section>
  );
}
