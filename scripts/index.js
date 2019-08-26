//
// Copyright (c) Autodesk, Inc. All rights reserved
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
//
// Forge AU Sample
// by Eason Kang - Autodesk Developer Network (ADN)
//

'use strict';

(function() {
  const options = {
    env: 'AutodeskProduction',
    accessToken: ''
  };
  const documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bGt3ZWo3eHBiZ3A2M3g0aGwzMzV5Nm0yNm9ha2dnb2YyMDE3MDUyOHQwMjQ3MzIzODZ6L3JhY19iYXNpY19zYW1wbGVfcHJvamVjdC5ydnQ';
  
  const config3d = {
    extensions: [
      'CustomPropertyPanelExtension'
    ]
  };
  const container = document.getElementById('MyViewerDiv');
  const viewer = new Autodesk.Viewing.GuiViewer3D(container, config3d);

  Autodesk.Viewing.Initializer(options, function() {
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
    
  function onDocumentLoadSuccess(doc) {
    const rootItem = doc.getRoot();
    const viewable = rootItem.getDefaultGeometry();

    if(!viewable) {
        console.error('Document contains no viewables.');
        return;
    }

    viewer.startWithDocumentNode( doc, viewable )
      .then( onLoadModelSuccess )
      .catch( onLoadModelError );
  }

  function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
  }

  function onLoadModelSuccess(model) {
    console.log( 'onLoadModelSuccess()!' );
    console.log( 'Validate model loaded: ' + ( viewer.model === model ) );
    console.log( model );

    //viewer.setDisplayEdges( false );
  }

  function onLoadModelError( viewerErrorCode ) {
      console.error( 'onLoadModelError() - errorCode:' + viewerErrorCode);
  }
})();