import React, { forwardRef, useMemo, useRef, useState, useEffect } from "react";
import {
  pluckCurrentTargetValue,
  useObservableCallback,
  useObservableState,
  useSubscription,
} from "observable-hooks";
import { timer } from "rxjs";
import { mapTo, switchMap } from "rxjs/operators";
import ForceGraph2D from "react-force-graph-2d";
import styles from "./Graph.module.scss";

// https://codesandbox.io/s/github/crimx/observable-hooks/tree/master/examples/typeahead?file=/src/custom-input.tsx
const Editor = forwardRef(function Editor(
  { children: value, onChange, ...rest },
  ref
) {
  const [onTextChange, textChange$] = useObservableCallback<
    string,
    React.FormEvent<HTMLTextAreaElement>
  >(pluckCurrentTargetValue);

  useSubscription(textChange$, onChange);

  return (
    <div className={styles.Editor}>
      <textarea ref={ref} value={value} onChange={onTextChange} {...rest} />
    </div>
  );
});

// https://medium.com/@jeffbutsch/using-d3-in-react-with-hooks-4a6c61f1d102
export function Graph({ data }) {
  return (
    <ForceGraph2D
      graphData={data}
      width={400}
      height={400}
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
  );
}

// https://github.com/vasturiano/react-force-graph/blob/master/example/text-nodes/index-2d.html
export default function Section() {
  const inputRef = useRef(null);
  const [text, setText] = useState(
    () =>
      `Napoleon --> Myriel
Mlle.Baptistine --> Myriel
Mme.Hucheloup --> Enjolras
`
  );

  const [parsed, updateText] = useObservableState(
    (text$) => text$.pipe(switchMap((text) => timer(400).pipe(mapTo(text)))),
    text
  );

  const data = useMemo(() => {
    const { ids, links } = parsed
      .split("\n")
      .map((line) => line.match(/^\s*(\S+)\s*-->\s*(\S+)\s*$/i))
      .filter(Boolean)
      .reduce(
        ({ ids, links }, [_, source, target]) => ({
          ids: {
            ...ids,
            [source]: source,
            [target]: target,
          },
          links: links.concat({
            source,
            target,
          }),
        }),
        { ids: {}, links: [] }
      );
    return {
      nodes: Object.keys(ids).map((id) => ({ id })),
      links,
    };
  }, [parsed]);

  useEffect(() => {
    updateText(text);
  }, [text]);

  return (
    <section className={styles.Section}>
      <h2>Graph</h2>
      <Graph data={data} />
      <Editor ref={inputRef} onChange={setText}>
        {text}
      </Editor>
    </section>
  );
}
