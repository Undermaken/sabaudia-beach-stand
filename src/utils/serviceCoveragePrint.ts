export const serviceCoveragePrintPageStyle = `
  @page {
    margin: 0;
    size: A4;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: #ffffff !important;
    color-scheme: light !important;
  }

  body {
    color: #17211f;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
`;
