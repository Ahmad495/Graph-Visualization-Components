const svg_pin = `<svg width="250" height="250" xmlns="http://www.w3.org/2000/svg">
<defs><filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="black" /></filter></defs>
<circle width="100%" height="100%" cx="125" cy="125" r="80" fill="white" style="filter: drop-shadow(0 5px 5px black);" />
<svg xmlns="http://www.w3.org/2000/svg" height="50" width="50" x="100" y="100" viewBox="0 0 512 512"><path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"/></svg>
</svg>`;

const svgpin_Url = encodeURI('data:image/svg+xml;utf-8,' + svg_pin);

const backgroundImageUrl = 'https://dbdb.io/media/logos/agedb.svg';

const labelTruncation = (label) => {
  const isKoreanLanguage = label.match(/[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/g);
  return isKoreanLanguage ? (label.length > 6 ? label.substring(0, 6) + '...' : label) : label.length > 8 ? label.substring(0, 8) + '...' : label;
};

export function IconStylesheet(showIcon, showImage, elements, showMultiproperty, checkNodeCount, edgeThickness, count) {
  let additionalStyles;
  let nodeLabelbackground;
  const handlePieChart = (ele, elements) => {};
  if (showMultiproperty) {
    additionalStyles = {
      'pie-size': '250%',
      'pie-1-background-color': '#F9C433',
      'pie-1-background-size': '50%',
      'pie-2-background-color': '#7AB74D',
      'pie-2-background-size': '12.5%',
      'pie-3-background-size': '12.5%',
      'pie-3-background-color': '#000000',
      'pie-4-background-size': '25%',
      'pie-4-background-color': '#3E7ED1',
    };
  }
  if (showIcon || showMultiproperty) {
    nodeLabelbackground = {
      'text-background-opacity': 1,
      color: 'black',
      'text-background-padding': '5px',
      'text-background-color': 'white',
      'text-background-shape': 'roundrectangle',
      'text-border-color': '#000',
      'text-border-width': 0.15,
      'text-border-opacity': 1,
      'shadow-blur': 20,
      'shadow-color': 'rgba(0, 0, 0, 0.3)',
      'shadow-offset-x': 0,
      'shadow-offset-y': 4,
    };
  }
  return [
    {
      selector: 'node',
      style: {
        shape: (ele) => {
          if (checkNodeCount) {
            let nodeTargetCount = 0;
            elements?.map((element) => {
              if (element?.data?.source) {
                if (ele.data('id') === element?.data?.source) {
                  nodeTargetCount++;
                }
              }
            });
            return nodeTargetCount >= 2 && !showMultiproperty ? 'octagon' : 'circle';
          } else {
            return 'circle';
          }
        },
        width: 25,
        height: 25,
        label: (ele) => {
          return showImage ? '' : labelTruncation(ele.data('label'));
        },
        'background-color': showImage ? 'white' : '#3E7ED1',
        'background-image': showIcon ? svgpin_Url : showImage && backgroundImageUrl,
        'background-width': showImage ? '70%' : '100%',
        'background-height': showImage ? '25%' : '100%',
        'background-repeat': 'no-repeat',
        'background-image-opacity': 1,
        'text-valign': 'center',
        'text-halign': 'center',
        color: 'white',
        'font-size': '10px',
        'font-family': 'roboto',
        'text-wrap': 'ellipsis',
        'text-max-width': function (ele) {
          return ele ? ele.data('size') : 55;
        },
        'border-width': showImage ? '1px' : '0px',
        'border-color': showMultiproperty || showIcon ? 'white' : 'grey',
        'text-margin-y': function (node) {
          return (showIcon || showMultiproperty) && node.height() + 10;
        },
        ...additionalStyles,
        ...nodeLabelbackground,
      },
    },
    {
      selector: 'node.highlight',
      style: {
        'border-width': '6px',
        'border-color': ' #00E3DB',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': '6px',
        'border-color': ' #00E3DB',
      },
    },
    {
      selector: 'edge',
      style: {
        'text-wrap': 'wrap',
        'curve-style': function (ele) {
          let curveType = 'straight';
          elements?.filter((edge, index) =>
            index > 0 && edge?.data?.source === ele.data('source') && edge?.data?.target === ele.data('target')
              ? (curveType = 'bezier')
              : (curveType = 'straight')
          );

          console.log(curveType);
          return curveType;
        },
        'target-arrow-shape': 'triangle',
        'arrow-scale': '1px',
        label(ele) {
          return labelTruncation(ele.data('label'));
        },
        width: edgeThickness,
        'text-background-color': '#FFF',
        'text-background-opacity': 1,
        'text-background-padding': '3px',
        'target-arrow-color': function (ele) {
          return ele ? ele.data('backgroundColor') : '#FFF';
        },
        color(ele) {
          return ele ? ele.data('fontColor') : '#FFF';
        },
        'target-distance-from-node': function (ele) {
          let distanceValue = 0;

          if (count.hasOwnProperty(ele?.data('target'))) {
            const targetNodeCount = count[ele?.data('target')];
            if (targetNodeCount >= 3) {
              distanceValue = 20;
            }
          }

          return distanceValue;
        },
        'font-size': '8px',
        'text-rotation': 'autorotate',
        'arrow-scale': '0.6',
        'loop-sweep': '30deg',
        'loop-direction': '40deg',
      },
    },
    {
      selector: 'edge.highlight',
      style: {
        width: '1',
        'line-color': '#00E3DB',
        'target-arrow-color': '#B2EBF4',
        'target-arrow-shape': 'triangle',
        'target-arrow-shape': 'triangle',
        'arrow-scale': '1px',
        opacity: '1',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        // width(ele) { return ele ? ele.data('size') : 1; },
        width: '1',
        'line-color': '#B2EBF4',
        'target-arrow-color': '#B2EBF4',
        'target-arrow-shape': 'triangle',
        'arrow-scale': '1px',
      },
    },
    {
      selector: 'node:degree > 1',
      style: {
        padding: '20px',
      },
    },
  ];
}
