import './styles.css';
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import CytoscapeComponent from 'react-cytoscapejs';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { JSONEditor } from './JSONEditor';
import { layouts } from './layouts';
import { generateGraph } from './generateGraph';
import setupCy from './setupCy';
import cytoscape, { Stylesheet } from 'cytoscape';
import cxtmenu from 'cytoscape-cxtmenu';
import contextMenus from 'cytoscape-context-menus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { IconStylesheet } from './stylesheet.js';
import popper from 'cytoscape-popper';
import Popper from 'popper.js/dist/umd/popper';
import 'tippy.js/dist/tippy.css';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
// import "font-awesome/css/font-awesome.min.css";

setupCy();

cytoscape.use(cxtmenu);
cytoscape.use(popper);
cytoscape.use(contextMenus);

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role='alert'>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export default function App() {
  const cyRef = React.useRef<cytoscape.Core | undefined>();
  const [elements, setElements] = React.useState(() => generateGraph(65));
  const [layout, setLayout] = React.useState(layouts.klay);
  const [showIcon, setShowIcon] = React.useState(false);
  const [showImage, setShowImage] = React.useState(false);
  const [checkNodeCount, setCheckNodeCount] = React.useState(false);
  const [numberOfNodes, setNumberOfNodes] = React.useState(0);
  const [showMultipropertyGraph, setShowMultipropertyGraph] = React.useState(false);
  const [edgeThickness, setEdgeThickness] = React.useState(0.5);
  const [stylesheet, setStylesheet] = React.useState<Stylesheet[]>(
    IconStylesheet(showIcon, showImage, elements, showMultipropertyGraph, checkNodeCount, edgeThickness)
  );

  const handleShowIcon = () => {
    let tempIconDisplay = false;
    let tempImageDisplay = false;
    let tempShowMultipropertyGraph = false;
    let tempCheckNodeCount = false;

    tempIconDisplay = !showIcon;
    setShowIcon(!showIcon);
    setStylesheet(IconStylesheet(tempIconDisplay, tempImageDisplay, elements, tempShowMultipropertyGraph, tempCheckNodeCount, edgeThickness));
  };
  const handleShowMultiPropertyGraph = () => {
    let tempIconDisplay = false;
    let tempImageDisplay = false;
    let tempShowMultipropertyGraph = false;
    let tempCheckNodeCount = false;

    tempShowMultipropertyGraph = !showMultipropertyGraph;
    setShowMultipropertyGraph(!showMultipropertyGraph);
    setStylesheet(IconStylesheet(tempIconDisplay, tempImageDisplay, elements, tempShowMultipropertyGraph, tempCheckNodeCount, edgeThickness));
  };

  const handleShowImage = () => {
    let tempImageDisplay = false;
    let tempIconDisplay = false;
    let tempShowMultipropertyGraph = false;
    let tempCheckNodeCount = false;

    tempImageDisplay = !showImage;
    setShowImage(!showImage);
    setShowMultipropertyGraph(false);
    setStylesheet(IconStylesheet(tempIconDisplay, tempImageDisplay, elements, tempShowMultipropertyGraph, tempCheckNodeCount, edgeThickness));
  };

  const handleCheckNodeCount = () => {
    let tempImageDisplay = false;
    let tempIconDisplay = false;
    let tempShowMultipropertyGraph = false;
    let tempCheckNodeCount = false;

    tempCheckNodeCount = !checkNodeCount;
    setCheckNodeCount(!checkNodeCount);
    setStylesheet(IconStylesheet(tempIconDisplay, tempImageDisplay, elements, tempShowMultipropertyGraph, tempCheckNodeCount, edgeThickness));
  };

  const initializeTooltip = (cy, selectedNode, isLocked) => {
    const node = cy.getElementById(selectedNode);

    if (!node.empty() && !isLocked) {
      const content = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M0 0h24v24H0z"/><path fill="white" d="m15.113 3.21l.094.083l5.5 5.5a1 1 0 0 1-1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1-.158.277l-.07.08l-1.5 1.5a1 1 0 0 1-1.32.082l-.095-.083L9 16.415l-3.793 3.792a1 1 0 0 1-1.497-1.32l.083-.094L7.585 15l-2.792-2.793a1 1 0 0 1-.083-1.32l.083-.094l1.5-1.5a1 1 0 0 1 .258-.187l.098-.042l3.796-1.425l3.171-3.17a1 1 0 0 1 1.497-1.26z"/></g></svg>`;

      // Create a tooltip element with styling
      const tooltipElement = document.createElement('div');
      tooltipElement.innerHTML = content;
      tooltipElement.className = 'tooltip';
      tooltipElement.id = selectedNode;
      tooltipElement.style.display = 'none'; // Start hidden
      tooltipElement.style.position = 'absolute';
      tooltipElement.style.padding = '2px';
      tooltipElement.style.backgroundColor = 'black';
      tooltipElement.style.color = '#fff';
      tooltipElement.style.borderRadius = '4px';
      tooltipElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      tooltipElement.style.zIndex = '9999';

      // Append the tooltip element to the body
      document.body.appendChild(tooltipElement);

      // Get the popper reference
      const popperRef = Array.isArray(node.popperRef()) ? node.popperRef()[0] : node.popperRef();

      // Initialize Popper.js
      const popperInstance = new Popper(popperRef, tooltipElement, {
        placement: 'top-end',
      });

      // Attach the popperInstance to the node for later use (e.g., for updates)
      node.popperInstance = popperInstance;

      tooltipElement.style.display = 'block';
      tooltipElement.style.marginRight = '-10em';
      popperInstance.update();
    } else if (node.popperInstance) {
      // Destroy the tooltip if it already exists
      const toolTipElement = document.getElementById(selectedNode);
      toolTipElement.remove();
      node.popperInstance.destroy();
      node.popperInstance = null;
    }
  };

  const initializeCxtMenu = (cy) => {
    cy.cxtmenu({
      menuRadius: 30,
      top: '50%',
      left: '50%',
      selector: 'node',
      commands: [
        {
          content: ReactDOMServer.renderToString(<FontAwesomeIcon icon={faEyeSlash} size='' />),
          select(ele) {
            ele.remove();
          },
        },
        {
          content: ReactDOMServer.renderToString(<FontAwesomeIcon icon={faThumbtack} size='lg' />),
          select(ele) {
            const selectedNode = ele.data('id');
            let isLocked = false;
            if (!ele.locked()) {
              initializeTooltip(cy, selectedNode, isLocked);
              ele.lock();
            } else {
              isLocked = true;
              initializeTooltip(cy, selectedNode, isLocked);
              ele.unlock();
            }
          },
        },
      ],
    });
  };

  const handleChangeNumberOfNodes = () => {
    if (numberOfNodes > 0 && numberOfNodes <= 70) {
      setElements(generateGraph(numberOfNodes));
    }
  };

  const detectOverlappingNodes = (cy) => {
    const allNodes = cy.nodes();

    allNodes.style({
      'border-color': '#2c3e50',
      'border-width': '0px',
    });

    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const node1 = allNodes[i];
        const node2 = allNodes[j];

        // Compare node positions (adjust the threshold as needed)
        const overlapThreshold = 50; // Adjust this value based on your tolerance for overlap
        const overlapX = Math.abs(node1.position().x - node2.position().x) < overlapThreshold;
        const overlapY = Math.abs(node1.position().y - node2.position().y) < overlapThreshold;

        if (overlapX && overlapY) {
          node1.style('border-color', 'white');
          node1.style('border-width', '2px');
          node2.style('border-color', 'white');
          node2.style('border-width', '2px');
        }
      }
    }
  };

  const handleEdgeThicknessIncrement = () => {
    let tempEdgeThickness = edgeThickness;
    tempEdgeThickness++;
    setEdgeThickness(tempEdgeThickness);
    setStylesheet(IconStylesheet(showIcon, showImage, elements, showMultipropertyGraph, checkNodeCount, tempEdgeThickness));
  };

  const handleEdgeThicknessdecrement = () => {
    let tempEdgeThickness = edgeThickness;
    if (tempEdgeThickness > 0.5) {
      tempEdgeThickness--;
      setEdgeThickness(tempEdgeThickness);
      setStylesheet(IconStylesheet(showIcon, showImage, elements, showMultipropertyGraph, checkNodeCount, tempEdgeThickness));
    }
  };

  const initializeContextMenu = (cy) => {
    const contextMenuConfig = {
      menuItems: [
        {
          id: 'lockNode',
          content: 'Lock Node',
          tooltipText: 'Tooltip for Option 1',
          selector: 'node', // Apply this option to nodes
          onClickFunction: function (event) {
            const target = event.target || event.cyTarget;
            initializeTooltip(cy, target.id(), false);
            target.lock();
          },
        },
        {
          id: 'unlockNode',
          content: 'Unlock Node',
          tooltipText: 'Tooltip for Option 1',
          selector: 'node', // Apply this option to nodes
          onClickFunction: function (event) {
            const target = event.target || event.cyTarget;
            initializeTooltip(cy, target.id(), true);
            target.unlock();
          },
        },
      ],
    };

    cy.contextMenus(contextMenuConfig);
  };

  return (
    <div className='App'>
      <table>
        <tbody>
          <tr>
            <td className='c'>
              <button
                onClick={() => {
                  setElements(generateGraph());
                }}
                style={{ marginBlock: '.5em' }}
              >
                new graph
              </button>
              <button
                onClick={() => {
                  setElements(generateGraph(65));
                }}
                style={{ marginBlock: '.5em' }}
              >
                new big graph
              </button>
              <button
                onClick={() => {
                  setElements(generateGraph(35, 7));
                }}
                style={{ marginBlock: '.5em' }}
              >
                new big disconnected graph
              </button>
              <button
                onClick={() => {
                  setElements(generateGraph(35, 20, true));
                }}
                style={{ marginBlock: '.5em' }}
              >
                new big acyclic graph
              </button>
              <br />
              layout preset:
              <br />
              <select
                size={Object.keys(layouts).length}
                onChange={(e) => {
                  setLayout({ ...layouts[e.target.value] });
                }}
              >
                {Object.keys(layouts).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <br />
              layout config:
              <br />
              <JSONEditor value={layout} onChange={setLayout} />
              <br />
              stylesheet:
              <br />
              <JSONEditor value={stylesheet} onChange={setStylesheet} />
            </td>
            <br />
            <td>
              <button onClick={handleShowIcon} style={{ margin: '.5em' }}>
                show icon
              </button>
              <button onClick={handleShowImage} style={{ margin: '.5em' }}>
                show image
              </button>
              <button onClick={handleShowMultiPropertyGraph} style={{ margin: '.5em' }}>
                Show Multiproperty Graph
              </button>
              {/* <button style={{ margin: ".5em" }} onClick={handleCheckNodeCount}>
                {checkNodeCount ? "Default Shape" : "Change Shape"}
              </button> */}
              <button style={{ margin: '.5em' }} onClick={handleEdgeThicknessIncrement}>
                Edge Thickness +
              </button>
              <button style={{ margin: '.5em' }} onClick={handleEdgeThicknessdecrement}>
                Edge Thickness -
              </button>
            </td>
            <label>Number of Nodes:</label>
            <input type='number' value={numberOfNodes} onChange={(e) => setNumberOfNodes(e.target.value)} />
            <button onClick={handleChangeNumberOfNodes}>update number of nodes</button>
            <td style={{ width: '100%' }}>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <CytoscapeComponent
                  elements={elements}
                  style={{
                    width: '100%',
                    height: '900px',
                    border: '1px solid black',
                  }}
                  layout={layout}
                  stylesheet={stylesheet}
                  cy={(cy) => {
                    cyRef.current = cy;
                    // initializeCxtMenu(cy);
                    detectOverlappingNodes(cy);
                    initializeContextMenu(cy);
                    cy.on('drag', 'node', (event) => {
                      detectOverlappingNodes(cy);
                    });
                  }}
                />
              </ErrorBoundary>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
