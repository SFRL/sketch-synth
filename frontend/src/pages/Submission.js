import Layout from "../components/Layout";
import "../css/layout.css";

function Submission(props) {
  return (
    <Layout heading={props.heading}>
      <section>{props.content}</section>
    </Layout>
  );
}

export default Submission;
