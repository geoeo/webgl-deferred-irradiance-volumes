// Generated by CoffeeScript 1.3.3
var Blur, DeferredShadowMap, DepthRender, LightmappedShadowMap, Rendernode;

Rendernode = require('/rendernode');

Blur = require('/blur');

exports.DepthRender = DepthRender = (function() {

  function DepthRender(gl, width, height, drawable, _arg) {
    var blurred;
    blurred = (_arg != null ? _arg : {}).blurred;
    if (blurred == null) {
      blurred = false;
    }
    this.direct = new Rendernode(gl, {
      width: width,
      height: height,
      program: get('depth.shader'),
      drawable: drawable,
      depthBuffer: true,
      depthTest: true,
      depthWrite: true,
      filter: blurred ? 'nearest' : 'linear',
      type: gl.FLOAT,
      cullFace: 'BACK'
    });
    if (blurred) {
      this.blurred = new Blur(gl, {
        width: width,
        height: height,
        type: gl.FLOAT
      });
    }
    this.output = this.blurred ? this.blurred.output : this.direct;
  }

  DepthRender.prototype.update = function(proj, view) {
    this.direct.start().clearBoth(0, 0, 0, 1).mat4('proj', proj).mat4('view', view).f('range', 42).draw().end();
    if (this.blurred) {
      return this.blurred.update(this.direct);
    }
  };

  return DepthRender;

})();

exports.DeferredShadowMap = DeferredShadowMap = (function() {

  function DeferredShadowMap(gl, _arg) {
    var blurred, depthHeight, depthWidth, drawable;
    drawable = _arg.drawable, depthWidth = _arg.depthWidth, depthHeight = _arg.depthHeight, this.eyeNormaldepth = _arg.eyeNormaldepth, this.light = _arg.light, this.camera = _arg.camera, blurred = _arg.blurred;
    this.depth = new DepthRender(gl, depthWidth, depthHeight, drawable, {
      blurred: blurred
    });
    this.output = new Rendernode(gl, {
      program: get('deferred_shadow_map.shader'),
      drawable: quad
    });
    this.updateDepth();
  }

  DeferredShadowMap.prototype.resize = function(width, height) {
    return this.output.resize(width, height);
  };

  DeferredShadowMap.prototype.updateDepth = function() {
    return this.depth.update(this.light.proj, this.light.view);
  };

  DeferredShadowMap.prototype.updateShadow = function() {
    return this.output.start().clear(1, 0, 1).sampler('eye_normaldepth', this.eyeNormaldepth).sampler('light_depth', this.depth.output).mat4('inv_eye_proj', this.camera.inv_proj).mat4('inv_eye_view', this.camera.inv_view).mat4('light_view', this.light.view).mat4('light_proj', this.light.proj).mat3('light_rot', this.light.rot).draw().end();
  };

  return DeferredShadowMap;

})();

exports.LightmapShadowMap = LightmappedShadowMap = (function() {

  function LightmappedShadowMap(gl, _arg) {
    var blurred, depthHeight, depthWidth, drawable, lightmapSize;
    drawable = _arg.drawable, depthWidth = _arg.depthWidth, depthHeight = _arg.depthHeight, lightmapSize = _arg.lightmapSize, this.light = _arg.light, blurred = _arg.blurred;
    this.depth = new DepthRender(gl, depthWidth, depthHeight, drawable, {
      blurred: blurred
    });
    if (lightmapSize == null) {
      lightmapSize = 256;
    }
    this.output = new Rendernode(gl, {
      width: lightmapSize,
      height: lightmapSize,
      program: get('lightmap_shadow_map.shader'),
      drawable: drawable
    });
    this.update();
  }

  LightmappedShadowMap.prototype.update = function() {
    this.depth.update(this.light.proj, this.light.view);
    return this.output.start().sampler('light_depth', this.depth.output).mat4('light_view', this.light.view).mat4('light_proj', this.light.proj).mat3('light_rot', this.light.rot).draw().end();
  };

  return LightmappedShadowMap;

})();
