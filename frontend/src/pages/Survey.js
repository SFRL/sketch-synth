import { useState } from "react";
import Layout from "../components/Layout";
import { USER_ID } from "../scripts/init";
import APIService from "../scripts/APIService";
import "../css/survey.css";

import { Loop } from "@material-ui/icons";
import "../css/loading.css";

const submitFormData = (e, callback) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const value = Object.fromEntries(formData.entries());

  const data = { id: USER_ID, survey: value };

  APIService.SendData(data, "survey")
    .then(() => callback({ valid: true, data: value }))
    .catch((error) => console.log(error));
};

function Survey(props) {
  const surveyQuestions = props.content;
  const [loading, setLoading] = useState(false);

  return (
    <Layout heading={props.heading}>
      <section>
        <form
          name="survey"
          onSubmit={(e) => {
            submitFormData(e, props.callback);
            setLoading(true);
          }}
        >
          {surveyQuestions}
          {loading ? (
            <>
              <h2>Submitting</h2>
              <Loop className={"loading-loop"} style={{ fontSize: "3em" }} />
            </>
          ) : (
            <button type="submit" value="Submit">
              Next
            </button>
          )}
        </form>
      </section>
    </Layout>
  );
}

export default Survey;
