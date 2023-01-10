import Layout from "../components/Layout";
import "../css/layout.css";
import "../css/button.css";

function TextPage(props) {
  const validationFn = props.validationFunction || (() => true);

  const validateData = () => {
    if (validationFn()) {
      props.callback({ valid: true, data: null });
    }
  };

  return (
    <Layout heading={props.heading}>
      <section>
        {props.content}
        <button onClick={() => validateData()}>Next</button>
      </section>
    </Layout>
  );
}

export default TextPage;
