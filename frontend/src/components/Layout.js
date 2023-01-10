import "../css/layout.css";

function Layout(props) {
  return (
    <>
      <header>
        <a
          href="https://mat.qmul.ac.uk/"
          target="_blank"
          rel="noopener noreferrer"
          id="MATLogo"
        >
          {""}
        </a>
        <div id="headercontent">{props.heading}</div>

        <div id="QMLogo"></div>
      </header>
      <main>{props.children}</main>
    </>
  );
}

export default Layout;
