/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismFramework, Option } from '@framework/live2dcubismframework';

import * as LAppDefine from './lappdefine';
import { LAppLive2DManager } from './lapplive2dmanager';
import { LAppPal } from './lapppal';
import { LAppTextureManager } from './lapptexturemanager';
import { LAppView } from './lappview';

export let canvas: HTMLCanvasElement = null;
export let s_instance: LAppDelegate = null;
export let gl: WebGLRenderingContext = null;
export let frameBuffer: WebGLFramebuffer = null;

/**
 * アプリケーションクラス。
 * Cubism SDKの管理を行う。
 */
export class LAppDelegate {
  /**
   * クラスのインスタンス（シングルトン）を返す。
   * インスタンスが生成されていない場合は内部でインスタンスを生成する。
   *
   * @return クラスのインスタンス
   */
  public static getInstance(): LAppDelegate {
    if (s_instance == null) {
      s_instance = new LAppDelegate();
    }

    return s_instance;
  }

  /**
   * クラスのインスタンス（シングルトン）を解放する。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance.release();
    }

    s_instance = null;
  }

  /**
   * APPに必要な物を初期化する。
   */
  public initialize(): boolean {
    // キャンバスの作成
    // canvas = document.createElement('canvas');
    canvas = <HTMLCanvasElement> document.getElementById("live2d"); // index.html中的id为live2d的画布
    canvas.width = canvas.width;
    canvas.height = canvas.height;
    this._resizeCanvas();
  
    // if (LAppDefine.CanvasSize === 'auto') {
    //       this._resizeCanvas();
    //     } else {
    //       canvas.width = LAppDefine.CanvasSize.width;
    //       canvas.height = LAppDefine.CanvasSize.height;
    //     }

    // glコンテキストを初期化
    // @ts-ignore
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      alert('Cannot initialize WebGL. This browser does not support.');
      gl = null;

      document.body.innerHTML =
        'This browser does not support the <code>&lt;canvas&gt;</code> element.';

      // gl初期化失敗
      return false;
    }

    // キャンバスを DOM に追加
    document.body.appendChild(canvas);

    if (!frameBuffer) {
      frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    }

    // 透過設定
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const supportTouch: boolean = 'ontouchend' in canvas;

    if (supportTouch) {
      // タッチ関連コールバック関数登録
      canvas.ontouchstart = onTouchBegan;
      canvas.ontouchmove = onTouchMoved;
      canvas.ontouchend = onTouchEnded;
      canvas.ontouchcancel = onTouchCancel;
    } else {
      // マウス関連コールバック関数登録
      canvas.onmousedown = onClickBegan;
      canvas.onmousemove = onMouseMoved;
      canvas.onmouseup = onClickEnded;
    }

    // AppViewの初期化
    this._view.initialize();

    // Cubism SDKの初期化
    this.initializeCubism();

    return true;
  }

  /**
   * Resize canvas and re-initialize view.
   */
  public onResize(): void {
    this._resizeCanvas();//重新设置canvas的宽高
    // this._view.initialize();//初始化view
    // this._view.initializeSprite();

    // キャンバスサイズを渡す
    const viewport: number[] = [0, 0, canvas.width, canvas.height];

    gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
  }

  /**
   * 解放する。
   */
  public release(): void {
    this._textureManager.release();
    this._textureManager = null;

    this._view.release();
    this._view = null;

    // リソースを解放
    LAppLive2DManager.releaseInstance();

    // Cubism SDKの解放
    CubismFramework.dispose();
  }

  /**
   * 実行処理。
   */
  public run(): void {
    // メインループ
    const loop = (): void => {
      // インスタンスの有無の確認
      if (s_instance == null) {
        return;
      }

      // 時間更新
      LAppPal.updateTime();

      // 画面の初期化
      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      // 深度テストを有効化
      gl.enable(gl.DEPTH_TEST);

      // 近くにある物体は、遠くにある物体を覆い隠す
      gl.depthFunc(gl.LEQUAL);

      // カラーバッファや深度バッファをクリアする
      // 清除彩色缓冲区和深度缓冲区  （加上这一句会导致有些浏览器背景变成黑色，而不是透明）
      // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.clearDepth(1.0);

      // 透過設定
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // 描画更新
      this._view.render();

      // ループのために再帰呼び出し
      requestAnimationFrame(loop);
    };
    loop();
  }

  /**
   * シェーダーを登録する。
   */
  public createShader(): WebGLProgram {
    // バーテックスシェーダーのコンパイル
    const vertexShaderId = gl.createShader(gl.VERTEX_SHADER);

    if (vertexShaderId == null) {
      LAppPal.printMessage('failed to create vertexShader');
      return null;
    }

    const vertexShader: string =
      'precision mediump float;' +
      'attribute vec3 position;' +
      'attribute vec2 uv;' +
      'varying vec2 vuv;' +
      'void main(void)' +
      '{' +
      '   gl_Position = vec4(position, 1.0);' +
      '   vuv = uv;' +
      '}';

    gl.shaderSource(vertexShaderId, vertexShader);
    gl.compileShader(vertexShaderId);

    // フラグメントシェーダのコンパイル
    const fragmentShaderId = gl.createShader(gl.FRAGMENT_SHADER);

    if (fragmentShaderId == null) {
      LAppPal.printMessage('failed to create fragmentShader');
      return null;
    }

    const fragmentShader: string =
      'precision mediump float;' +
      'varying vec2 vuv;' +
      'uniform sampler2D texture;' +
      'void main(void)' +
      '{' +
      '   gl_FragColor = texture2D(texture, vuv);' +
      '}';

    gl.shaderSource(fragmentShaderId, fragmentShader);
    gl.compileShader(fragmentShaderId);

    // プログラムオブジェクトの作成
    const programId = gl.createProgram();
    gl.attachShader(programId, vertexShaderId);
    gl.attachShader(programId, fragmentShaderId);

    gl.deleteShader(vertexShaderId);
    gl.deleteShader(fragmentShaderId);

    // リンク
    gl.linkProgram(programId);

    gl.useProgram(programId);

    return programId;
  }

  /**
   * View情報を取得する。
   */
  public getView(): LAppView {
    return this._view;
  }

  public getTextureManager(): LAppTextureManager {
    return this._textureManager;
  }

  /**
   * コンストラクタ
   */
  constructor() {
    this._captured = false;
    this._mouseX = 0.0;
    this._mouseY = 0.0;
    this._isEnd = false;

    this._cubismOption = new Option();
    this._view = new LAppView();
    this._textureManager = new LAppTextureManager();
  }

  /**
   * Cubism SDKの初期化
   */
  public initializeCubism(): void {
    // setup cubism
    this._cubismOption.logFunction = LAppPal.printMessage;
    this._cubismOption.loggingLevel = LAppDefine.CubismLoggingLevel;
    CubismFramework.startUp(this._cubismOption);

    // initialize cubism
    CubismFramework.initialize();

    // load model
    LAppLive2DManager.getInstance();

    LAppPal.updateTime();

    this._view.initializeSprite();
  }

  /**
   * Resize the canvas to fill the screen.
   */
  
  private _resizeCanvas(): void {
    // canvas.width = 300;
    // canvas.height = 400;

    // 测试得到的容器元素的宽度和高度总有问题，最后发现resize后什么都不做是最好的
    // let tmpcontainer = canvas.parentElement; // 获取 canvas 的容器元素
    // if (tmpcontainer) {
    //   // 设置 canvas 宽度和高度为容器元素的宽度和高度
    //   canvas.width = tmpcontainer.clientWidth;
    //   canvas.height = tmpcontainer.clientHeight;
      console.log(`Canvas height: ${canvas.height}px`);
      console.log(`Canvas width: ${canvas.width}px`);
    // }
  
    // canvas.width = window.innerWidth;//源代码是整个浏览器屏幕
    // canvas.height = window.innerHeight;
  // }
  }
  _cubismOption: Option; // Cubism SDK Option
  _view: LAppView; // View情報
  _captured: boolean; // クリックしているか
  _mouseX: number; // マウスX座標
  _mouseY: number; // マウスY座標
  _isEnd: boolean; // APP終了しているか
  _textureManager: LAppTextureManager; // テクスチャマネージャー
}

/**
 * クリックしたときに呼ばれる。
 */
function onClickBegan(e: MouseEvent): void {
  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }
  LAppDelegate.getInstance()._captured = true;

  const posX: number = e.pageX;
  const posY: number = e.pageY;

  LAppDelegate.getInstance()._view.onTouchesBegan(posX, posY);
}

/**
 * マウスポインタが動いたら呼ばれる。
 */

document.addEventListener('mousemove', onMouseMoved);

function onMouseMoved(e: MouseEvent): void {
  // 注释掉使得鼠标不用点击也能继续往下运行
  // if (!LAppDelegate.getInstance()._captured) {
  //   return;
  // }

  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  // e.clientX和e.clientY获取的坐标点都是以左上角为原点
  const rect = (e.target as Element).getBoundingClientRect();
  // const posX: number = e.clientX - rect.left;
  // const posY: number = e.clientY - rect.top;
  let posX: number = e.clientX;
  let posY: number = e.clientY - (window.innerHeight - canvas.height);

  // 图像在网页的坐下角，简单处理坐标将超过画布边界坐标就等与边界坐标
  posX = (posX > canvas.width) ? canvas.width : posX;
  posY = (posY < 0) ? 0 : posY;

  // 转换坐标，调用LAppLive2DManager类重新绘制图像
  LAppDelegate.getInstance()._view.onTouchesMoved(posX, posY);

}

/**
 * クリックが終了したら呼ばれる。
 */
function onClickEnded(e: MouseEvent): void {
  LAppDelegate.getInstance()._captured = false;
  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  const rect = (e.target as Element).getBoundingClientRect();
  const posX: number = e.clientX - rect.left;
  const posY: number = e.clientY - rect.top;

  LAppDelegate.getInstance()._view.onTouchesEnded(posX, posY);
}

/**
 * タッチしたときに呼ばれる。
 */
function onTouchBegan(e: TouchEvent): void {
  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  LAppDelegate.getInstance()._captured = true;

  const posX = e.changedTouches[0].pageX;
  const posY = e.changedTouches[0].pageY;

  LAppDelegate.getInstance()._view.onTouchesBegan(posX, posY);
}

/**
 * スワイプすると呼ばれる。
 */
function onTouchMoved(e: TouchEvent): void {
  if (!LAppDelegate.getInstance()._captured) {
    return;
  }

  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  const rect = (e.target as Element).getBoundingClientRect();

  const posX = e.changedTouches[0].clientX - rect.left;
  const posY = e.changedTouches[0].clientY - rect.top;

  LAppDelegate.getInstance()._view.onTouchesMoved(posX, posY);

}

/**
 * タッチが終了したら呼ばれる。
 */
function onTouchEnded(e: TouchEvent): void {
  LAppDelegate.getInstance()._captured = false;

  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  const rect = (e.target as Element).getBoundingClientRect();

  const posX = e.changedTouches[0].clientX - rect.left;
  const posY = e.changedTouches[0].clientY - rect.top;

  LAppDelegate.getInstance()._view.onTouchesEnded(posX, posY);
}

/**
 * タッチがキャンセルされると呼ばれる。
 */
function onTouchCancel(e: TouchEvent): void {
  LAppDelegate.getInstance()._captured = false;

  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  const rect = (e.target as Element).getBoundingClientRect();

  const posX = e.changedTouches[0].clientX - rect.left;
  const posY = e.changedTouches[0].clientY - rect.top;

  LAppDelegate.getInstance()._view.onTouchesEnded(posX, posY);
}
