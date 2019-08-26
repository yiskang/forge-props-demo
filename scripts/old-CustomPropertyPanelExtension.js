// Custom Property Panel
// *******************************************

function getServerUrl() {
  return document.location.protocol + '//' + document.location.host;
}

function CustomPropertyPanel(viewer, options) {
  this.viewer = viewer; 
  this.options = options; 
  this.nodeId = -1; // dbId of the current element showing properties
  Autodesk.Viewing.Extensions.ViewerPropertyPanel.call(this, this.viewer);
}
CustomPropertyPanel.prototype = Object.create(Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype);
CustomPropertyPanel.prototype.constructor = CustomPropertyPanel;

CustomPropertyPanel.prototype.getRemoteProps = function ( dbId ) {
  return new Promise(( resolve, reject ) => {
    const srvUrl = getServerUrl();
    fetch( `${ srvUrl }/api/props?_expand=dataType&dbId=${ dbId }`, {
      method: 'get',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then( ( response ) => {
        if( response.status === 200 ) {
          return response.json();
        } else {
          return reject( new Error( response.statusText ) );
        }
      })
      .then( ( data ) => {
        if( !data ) return reject( new Error( 'Failed to fetch properties from the server' ) );

        return resolve( data );
      })
      .catch( ( error ) => reject( new Error( error ) ) );
  });
}

CustomPropertyPanel.prototype.setProperties = async function (properties, options) {
  Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype.setProperties.call(this, properties, options);

  const result = await this.getRemoteProps( this.nodeId );

  for (let i=0; i < result.length; ++i) {
    const data = result[i];

    const precision = data.precision || Autodesk.Viewing.Private.calculatePrecision(data.displayValue);
    const value = Autodesk.Viewing.Private.formatValueWithUnits(data.value, data.units, data.type, precision);

    this.addProperty(data.displayName, value, data.category);
  }

};

CustomPropertyPanel.prototype.setNodeProperties = function (nodeId) {
  Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype.setNodeProperties.call(this, nodeId);
  this.nodeId = nodeId; // store the dbId for later use
};

// *******************************************
// Custom Property Panel Extension
// *******************************************
function CustomPropertyPanelExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);

  this.viewer = viewer;
  this.options = options;
  this.panel = null;
}

CustomPropertyPanelExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
CustomPropertyPanelExtension.prototype.constructor = CustomPropertyPanelExtension;

CustomPropertyPanelExtension.prototype.load = function () {
  this.panel = new CustomPropertyPanel(this.viewer, this.options);
  this.viewer.setPropertyPanel(this.panel);
  return true;
};

CustomPropertyPanelExtension.prototype.unload = function () {
  this.viewer.setPropertyPanel(null);
  this.panel = null;
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('CustomPropertyPanelExtension', CustomPropertyPanelExtension);