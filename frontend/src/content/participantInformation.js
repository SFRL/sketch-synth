import infoPdf from "../pdfs/Lobbers_Information_Sheet_Sketch Synth_Evaluation_of_a_sketch-based_synthesiser.pdf";
// import PDFViewer from "pdf-viewer-reactjs";
const showPdf = (pdf, e) => {
  e.preventDefault();
  window.open(pdf);
};

const html = (
  <>
    <h2>Participant Information Sheet</h2>
    <p>
      {" "}
      You are being invited to participate in a research study. The purpose of
      this study is to{" "}
      <strong>
        evaluate a prototype of a system that produces a sound based on a sketch
        input
      </strong>
      . The results will be helpful to improve the prototype towards the
      development of a sketch-based sound synthesiser. You can find out more
      about this PhD research{" "}
      <a
        href="https://sebastianlobbers.com/research/"
        target="_blank"
        rel="noopener noreferrer"
      >
        here
      </a>
      .
    </p>
    <p>
      {" "}
      Please{" "}
      <a href="#root" onClick={(e) => showPdf(infoPdf, e)}>
        download
      </a>{" "}
      and read the participant information carefully before proceeding to the
      study.
    </p>
    <p>
      By pressing "Next" you confirm that you have downloaded and read the
      participant information.
    </p>
  </>
);

const exportContent = { content: html, validation: false };
export default exportContent;
