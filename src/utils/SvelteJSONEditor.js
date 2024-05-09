import { JSONEditor } from "svelte-jsoneditor/dist/jsoneditor.js";
import { useEffect, useRef } from "react";
import "../assets/css/home/SvelteJSONEditor.css";

export default function SvelteJSONEditor(props) {
  const editor = useRef(null);

  // create editor
  const onRef = (ref) => {
    if (ref && !editor.current) {
      editor.current = new JSONEditor({
        target: ref,
        props
      });
    }
  };

  // update props
  useEffect(() => {
    if (editor.current) {
      editor.current.updateProps(props);
    }
  }, [props]);

  // destroy editor
  useEffect(() => {
    return () => {
      if (editor.current) {
        editor.current.destroy();
        editor.current = null;
      }
    };
  }, []);

  return <div className="svelte-jsoneditor-react" ref={onRef}></div>;
}
