// Custom Property Panel
// *******************************************

function getServerUrl() {
  return document.location.protocol + '//' + document.location.host;
}

class CustomPropertyPanel extends Autodesk.Viewing.Extensions.ViewerPropertyPanel {
  constructor(viewer, options) {
    super(viewer);
    this.viewer = viewer; 
    this.options = options; 
    this.nodeId = -1; // dbId of the current element showing properties 
  }

  getRemoteProps( dbId ) {
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

  requestProperties() {
    if (this.isVisible() && this.isDirty) {

      if (this.currentModel != null && this.currentNodeIds.length > 0) {
        this.requestNodeProperties(this.currentNodeIds[0]);
      } else {
        this.showDefaultProperties();
      }
      this.isDirty = false;
    }
  }

  async setProperties(properties, options) {
    super.setProperties(properties, options);
  
    const result = await this.getRemoteProps( this.nodeId );
  
    for (let i=0; i < result.length; ++i) {
      const data = result[i];
  
      const precision = data.precision || Autodesk.Viewing.Private.calculatePrecision(data.displayValue);
      const value = Autodesk.Viewing.Private.formatValueWithUnits(data.value, data.units, data.type, precision);
  
      this.addProperty(data.displayName, value, data.category);
    }
  }

  requestNodeProperties(nodeId) {
    super.setNodeProperties(nodeId);
    this.nodeId = nodeId; // store the dbId for later use
  }
}

// *******************************************
// Custom Property Panel Extension
// *******************************************
class CustomPropertyPanelExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);

    this.viewer = viewer;
    this.options = options;
    this.panel = null;
  }

  async onToolbarCreated() {
    let ext = await this.viewer.loadExtension('Autodesk.PropertiesManager');
    this.panel = new CustomPropertyPanel(this.viewer, this.options);
    ext.setPanel(this.panel);
  }

  load() {
    return true;
  }

  unload() {
    let ext = this.viewer.getExtension('Autodesk.PropertiesManager');
    ext.setPanel(null);
    this.panel = null;
    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('CustomPropertyPanelExtension', CustomPropertyPanelExtension);