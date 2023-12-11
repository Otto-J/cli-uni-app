const plugins = [
  {
    name: "vite:vue",
    api: {
      options: {
        isProduction: false,
        compiler: null,
        include: [
          {
          },
        ],
        customElement: {
        },
        reactivityTransform: false,
        style: {
          postcssPlugins: [
            {
              postcssPlugin: "uni-sfc-scoped",
              prepare: function({ processor: { plugins } }) {
                const hasVueSfcScoped = !!plugins.find((plugin) => plugin.postcssPlugin === 'vue-sfc-scoped');
                return {
                    Rule(rule) {
                        processRule(rule, hasVueSfcScoped);
                    },
                };
              },
            },
          ],
        },
        template: {
          compilerOptions: {
            miniProgram: {
              event: undefined,
              class: {
                array: false,
              },
              filter: {
                lang: "sjs",
              },
              directive: "tt:",
              lazyElement: undefined,
              component: {
                dir: "ttcomponents",
                vShow: "bind:-data-c-h",
                mergeVirtualHostAttributes: undefined,
              },
              emitFile: (emittedFile) => {
                if (emittedFile.type === 'asset') {
                    const filename = emittedFile.fileName;
                    (0, uni_cli_shared_1.addMiniProgramTemplateFile)((0, uni_cli_shared_1.removeExt)((0, uni_cli_shared_1.normalizeMiniProgramFilename)(path_1.default.relative(process.env.UNI_INPUT_DIR, filename))), emittedFile.source.toString());
                    debugTemplate(filename);
                    return filename;
                }
                return '';
              },
              slot: {
                fallbackContent: false,
                dynamicSlotNames: false,
              },
            },
            isNativeTag: (tag) => {
              if (isNativeTag(tag)) {
                  return true;
              }
              if (userIsNativeTag && userIsNativeTag(tag)) {
                  return true;
              }
              return false;
            },
            isCustomElement: (tag) => {
              if (isCustomElement(tag)) {
                  return true;
              }
              if (userIsCustomElement && userIsCustomElement(tag)) {
                  return true;
              }
              return false;
            },
            directiveTransforms: {
            },
            nodeTransforms: [
              (node, context) => exports.transformAssetUrl(node, context, options),
              (node, context) => exports.transformSrcset(node, context, options),
              (node, context) => {
                // 发现是page-meta下的head,直接remove该节点
                (0, utils_1.checkElementNodeTag)(node, 'head') &&
                    (0, utils_1.checkElementNodeTag)(context.parent, 'page-meta') &&
                    context.removeNode(node);
              },
              function transformRef(node, context) {
                if (!(0, utils_1.isUserComponent)(node, context)) {
                    return;
                }
                addVueRef(node, context);
              },
              function transformSwiper(node) {
                if (node.type !== 1 /* NodeTypes.ELEMENT */ || node.tag !== 'swiper') {
                    return;
                }
                const disableTouchProp = compilerCore.findProp(node, 'disable-touch', false, true);
                if (!disableTouchProp) {
                    return;
                }
                const { props } = node;
                if (disableTouchProp.type === 6 /* NodeTypes.ATTRIBUTE */) {
                    // <swiper disable-touch/> => <swiper :touchable="false"/>
                    props.splice(props.indexOf(disableTouchProp), 1, uniCliShared.createBindDirectiveNode('touchable', 'false'));
                }
                else {
                    if (disableTouchProp.exp) {
                        // <swiper :disable-touch="true"/> => <swiper :touchable="!(true)"/>
                        let touchable = '';
                        if (disableTouchProp.exp.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */) {
                            if (disableTouchProp.exp.content === 'true') {
                                touchable = 'false';
                            }
                            else if (disableTouchProp.exp.content === 'false') {
                                touchable = 'true';
                            }
                        }
                        props.splice(props.indexOf(disableTouchProp), 1, uniCliShared.createBindDirectiveNode('touchable', touchable || `!(${uniMpCompiler.genExpr(disableTouchProp.exp)})`));
                    }
                }
              },
              function transformTag(node, context) {
                if (!(0, ast_1.isElementNode)(node)) {
                    return;
                }
                const oldTag = node.tag;
                const newTag = opts[oldTag];
                if (!newTag) {
                    return;
                }
                node.tag = newTag;
              },
              function transformComponentLink(node, context) {
                if (!(0, utils_1.isUserComponent)(node, context)) {
                    return;
                }
                if (type === 7 /* NodeTypes.DIRECTIVE */) {
                    node.props.push({
                        type: 7 /* NodeTypes.DIRECTIVE */,
                        name: 'on',
                        modifiers: [],
                        loc: compiler_core_1.locStub,
                        arg: (0, compiler_core_1.createSimpleExpression)(name, true),
                        exp: (0, compiler_core_1.createSimpleExpression)('__l', true),
                    });
                }
                else {
                    node.props.push((0, utils_1.createAttributeNode)(name, '__l'));
                }
              },
            ],
            hoistStatic: false,
            root: "/Users/otto/mycode/dcloud/basic-vue3/src",
          },
          compiler: {
            findProp: function findProp(node, name, dynamicOnly = false, allowEmpty = false) {
              for (let i = 0; i < node.props.length; i++) {
                  const p = node.props[i];
                  if (p.type === 6 /* NodeTypes.ATTRIBUTE */) {
                      if (dynamicOnly)
                          continue;
                      if (p.name === name && (p.value || allowEmpty)) {
                          return p;
                      }
                  }
                  else if (p.name === 'bind' &&
                      (p.exp || allowEmpty) &&
                      isStaticArgOf(p.arg, name)) {
                      return p;
                  }
              }
            },
            genExpr: function genExpr(node, context) {
              return genNode(node, context).code;
            },
            rewriteExpression: function rewriteExpression(node, context, babelNode, scope = context.currentScope, { property, ignoreLiteral, referencedScope, } = {
              property: true,
              ignoreLiteral: false,
              }) {
              if (node.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */ && node.isStatic) {
                  return node;
              }
              if (!babelNode) {
                  const code = (0, codegen_1.genExpr)(node);
                  babelNode = (0, ast_1.parseExpr)(code, context, node);
                  if (!babelNode) {
                      return (0, compiler_core_1.createSimpleExpression)(code);
                  }
              }
              if (!ignoreLiteral && isStaticLiteral(babelNode)) {
                  return node;
              }
              if ((0, ast_1.isUndefined)(babelNode)) {
                  return (0, compiler_core_1.createSimpleExpression)('undefined', false, node.loc);
              }
              // wxs 等表达式
              if (context.filters?.length) {
                  if (isReferencedByIds(babelNode, context.filters)) {
                      return (0, compiler_core_1.createSimpleExpression)((0, codegen_1.genExpr)(node), false, node.loc);
                  }
              }
              referencedScope = referencedScope || findReferencedScope(babelNode, scope);
              const id = referencedScope.id.next();
              if (property) {
                  referencedScope.properties.push((0, types_1.objectProperty)((0, types_1.identifier)(id), babelNode));
              }
              // 在 v-for 中包含的 v-if 块，所有变量需要补充当前 v-for value 前缀
              if ((0, transform_1.isVIfScope)(referencedScope)) {
                  if ((0, transform_1.isVForScope)(referencedScope.parentScope)) {
                      return (0, compiler_core_1.createSimpleExpression)(referencedScope.parentScope.valueAlias + '.' + id);
                  }
                  return (0, compiler_core_1.createSimpleExpression)(id);
              }
              else if ((0, transform_1.isVForScope)(referencedScope)) {
                  return (0, compiler_core_1.createSimpleExpression)(referencedScope.valueAlias + '.' + id);
              }
              return (0, compiler_core_1.createSimpleExpression)(id);
            },
            isForElementNode: function isForElementNode(node) {
              return !!node.vFor;
            },
            transformOn: (dir, node, _context, augmentor) => {
              const context = _context;
              const { loc, modifiers, arg } = dir;
              if (!dir.exp && !modifiers.length) {
                  context.onError((0, compiler_core_1.createCompilerError)(35 /* ErrorCodes.X_V_ON_NO_EXPRESSION */, loc));
              }
              let eventName;
              if (arg.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */) {
                  if (arg.isStatic) {
                      const rawName = arg.content;
                      // for all event listeners, auto convert it to camelCase. See issue #2249
                      eventName = (0, compiler_core_1.createSimpleExpression)((0, shared_1.toHandlerKey)((0, shared_1.camelize)(rawName)), true, arg.loc);
                  }
                  else {
                      // #2388
                      eventName = (0, compiler_core_1.createCompoundExpression)([
                          // `${context.helperString(TO_HANDLER_KEY)}(`,
                          arg,
                          // `)`,
                      ]);
                  }
              }
              else {
                  // already a compound expression.
                  eventName = arg;
                  eventName.children.unshift(`${context.helperString(compiler_core_1.TO_HANDLER_KEY)}(`);
                  eventName.children.push(`)`);
              }
              // handler processing
              let exp = dir.exp;
              if (exp && !exp.content.trim()) {
                  exp = undefined;
              }
              let shouldCache = context.cacheHandlers && !exp && !context.inVOnce;
              if (exp) {
                  const isMemberExp = (0, compiler_core_1.isMemberExpression)(exp.content, context);
                  const isInlineStatement = !(isMemberExp || fnExpRE.test(exp.content));
                  const hasMultipleStatements = exp.content.includes(`;`);
                  // process the expression since it's been skipped
                  if (context.prefixIdentifiers) {
                      isInlineStatement && context.addIdentifiers(`$event`);
                      exp = dir.exp = (0, transformExpression_1.processExpression)(exp, context, false, hasMultipleStatements);
                      isInlineStatement && context.removeIdentifiers(`$event`);
                      // with scope analysis, the function is hoistable if it has no reference
                      // to scope variables.
                      shouldCache =
                          context.cacheHandlers &&
                              // unnecessary to cache inside v-once
                              !context.inVOnce &&
                              // runtime constants don't need to be cached
                              // (this is analyzed by compileScript in SFC <script setup>)
                              !(exp.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */ && exp.constType > 0) &&
                              // #1541 bail if this is a member exp handler passed to a component -
                              // we need to use the original function to preserve arity,
                              // e.g. <transition> relies on checking cb.length to determine
                              // transition end handling. Inline function is ok since its arity
                              // is preserved even when cached.
                              !(isMemberExp && node.tagType === 1 /* ElementTypes.COMPONENT */) &&
                              // bail if the function references closure variables (v-for, v-slot)
                              // it must be passed fresh to avoid stale values.
                              !(0, compiler_core_1.hasScopeRef)(exp, context.identifiers) &&
                              // wxs event
                              !isFilterExpr(exp, context);
                      // If the expression is optimizable and is a member expression pointing
                      // to a function, turn it into invocation (and wrap in an arrow function
                      // below) so that it always accesses the latest value when called - thus
                      // avoiding the need to be patched.
                      if (shouldCache && isMemberExp) {
                          if (exp.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */) {
                              exp.content = `${exp.content} && ${exp.content}(...args)`;
                          }
                          else {
                              exp.children = [...exp.children, ` && `, ...exp.children, `(...args)`];
                          }
                      }
                  }
                  if (isInlineStatement || (shouldCache && isMemberExp)) {
                      // wrap inline statement in a function expression
                      exp = (0, compiler_core_1.createCompoundExpression)([
                          `${isInlineStatement
                              ? context.isTS
                                  ? `($event: any)`
                                  : `$event`
                              : `${context.isTS ? `\n//@ts-ignore\n` : ``}(...args)`} => ${hasMultipleStatements ? `{` : `(`}`,
                          exp,
                          hasMultipleStatements ? `}` : `)`,
                      ]);
                  }
              }
              let ret = {
                  props: [
                      (0, compiler_core_1.createObjectProperty)(eventName, exp || (0, compiler_core_1.createSimpleExpression)(`() => {}`, false, loc)),
                  ],
              };
              // apply extended compiler augmentor
              if (augmentor) {
                  ret = augmentor(ret);
              }
              // TODO
              if (shouldCache) {
                  // cache handlers so that it's always the same handler being passed down.
                  // this avoids unnecessary re-renders when users use inline handlers on
                  // components.
                  // ret.props[0].value = wrapper(
                  //   context.cache(ret.props[0].value) as ExpressionNode,
                  //   context
                  // )
                  ret.props[0].value = wrapperVOn(ret.props[0].value, node, context);
              }
              else {
                  ret.props[0].value = wrapperVOn(ret.props[0].value, node, context);
              }
              // mark the key as handler for props normalization check
              ret.props.forEach((p) => (p.key.isHandlerKey = true));
              return ret;
            },
            transformModel: (dir, node, _context) => {
              const context = _context;
              const baseResult = (0, compiler_core_1.transformModel)(dir, node, _context);
              // base transform has errors OR component v-model (only need props)
              if (!baseResult.props.length || node.tagType === 1 /* ElementTypes.COMPONENT */) {
                  return transformComponentVModel(baseResult.props, node, context);
              }
              if (dir.arg) {
                  context.onError((0, compiler_dom_1.createDOMCompilerError)(56 /* DOMErrorCodes.X_V_MODEL_ARG_ON_ELEMENT */, dir.arg.loc));
              }
              function checkDuplicatedValue() {
                  const value = (0, compiler_core_1.findProp)(node, 'value');
                  if (value) {
                      context.onError((0, compiler_dom_1.createDOMCompilerError)(58 /* DOMErrorCodes.X_V_MODEL_UNNECESSARY_VALUE */, value.loc));
                  }
              }
              const { tag } = node;
              if (tag === 'input' || tag === 'textarea') {
                  checkDuplicatedValue();
              }
              else {
                  context.onError((0, compiler_dom_1.createDOMCompilerError)(55 /* DOMErrorCodes.X_V_MODEL_ON_INVALID_ELEMENT */, dir.loc));
              }
              if (dir.modifiers.length) {
                  const arg = dir.arg;
                  const modifiers = dir.modifiers
                      .map((m) => ((0, compiler_core_1.isSimpleIdentifier)(m) ? m : JSON.stringify(m)) + `: true`)
                      .join(`, `);
                  const modifiersKey = arg
                      ? (0, compiler_core_1.isStaticExp)(arg)
                          ? `${arg.content}Modifiers`
                          : (0, compiler_core_1.createCompoundExpression)([arg, ' + "Modifiers"'])
                      : `modelModifiers`;
                  baseResult.props.push((0, compiler_core_1.createObjectProperty)(modifiersKey, (0, compiler_core_1.createSimpleExpression)(`{ ${modifiers} }`, false, dir.loc, 2 /* ConstantTypes.CAN_HOIST */)));
              }
              return transformElementVModel(baseResult.props, node, context);
            },
            parse: function parse(template, options = {}) {
              return (0, compiler_core_1.baseParse)(template, (0, shared_1.extend)({}, parserOptions_1.parserOptions, options));
            },
            compile: function compile(template, options = {}) {
              return (0, compile_1.baseCompile)(template, (0, shared_1.extend)({}, parserOptions_1.parserOptions, options, {
                  directiveTransforms: (0, shared_1.extend)({}, options.directiveTransforms || {}),
              }));
            },
            V_ON: Symbol(vOn),
            V_FOR: Symbol(vFor),
            EXTEND: Symbol(extend),
            SET_REF: Symbol(setRef),
            CAMELIZE: Symbol(camelize),
            HYPHENATE: Symbol(hyphenate),
            RENDER_PROPS: Symbol(renderProps),
            RENDER_SLOT: Symbol(renderSlot),
            DYNAMIC_SLOT: Symbol(dynamicSlot),
            WITH_SCOPED_SLOT: Symbol(withScopedSlot),
            STRINGIFY_STYLE: Symbol(stringifyStyle),
            NORMALIZE_CLASS: Symbol(normalizeClass),
            TO_DISPLAY_STRING: Symbol(toDisplayString),
            WITH_MODEL_MODIFIERS: Symbol(withModelModifiers),
          },
          transformAssetUrls: {
            tags: {
            },
          },
        },
        root: "/Users/otto/mycode/dcloud/basic-vue3",
        sourceMap: true,
        cssDevSourcemap: false,
        devToolsEnabled: true,
      },
      version: "4.5.1",
    },
    handleHotUpdate: function(ctx) {
      if (options.value.compiler.invalidateTypeCache) {
        options.value.compiler.invalidateTypeCache(ctx.file);
      }
      if (typeDepToSFCMap.has(ctx.file)) {
        return handleTypeDepChange(typeDepToSFCMap.get(ctx.file), ctx);
      }
      if (filter.value(ctx.file)) {
        return handleHotUpdate(ctx, options.value);
      }
    },
    config: function(config) {
      return {
        resolve: {
          dedupe: config.build?.ssr ? [] : ["vue"]
        },
        define: {
          __VUE_OPTIONS_API__: config.define?.__VUE_OPTIONS_API__ ?? true,
          __VUE_PROD_DEVTOOLS__: config.define?.__VUE_PROD_DEVTOOLS__ ?? false
        },
        ssr: {
          // @ts-ignore -- config.legacy.buildSsrCjsExternalHeuristics will be removed in Vite 5
          external: config.legacy?.buildSsrCjsExternalHeuristics ? ["vue", "@vue/server-renderer"] : []
        }
      };
    },
    configResolved: function(config) {
      options.value = {
        ...options.value,
        root: config.root,
        sourceMap: config.command === "build" ? !!config.build.sourcemap : true,
        cssDevSourcemap: config.css?.devSourcemap ?? false,
        isProduction: config.isProduction,
        devToolsEnabled: !!config.define.__VUE_PROD_DEVTOOLS__ || !config.isProduction
      };
    },
    configureServer: function(server) {
      options.value.devServer = server;
    },
    buildStart: function() {
      const compiler = options.value.compiler = options.value.compiler || resolveCompiler(options.value.root);
      if (compiler.invalidateTypeCache) {
        options.value.devServer?.watcher.on("unlink", (file) => {
          compiler.invalidateTypeCache(file);
        });
      }
    },
    resolveId: async resolveId(id) {
      if (id === EXPORT_HELPER_ID) {
        return id;
      }
      if (parseVueRequest(id).query.vue) {
        return id;
      }
    },
    load: function(id, opt) {
      const ssr = opt?.ssr === true;
      if (id === EXPORT_HELPER_ID) {
        return helperCode;
      }
      const { filename, query } = parseVueRequest(id);
      if (query.vue) {
        if (query.src) {
          return fs__default.readFileSync(filename, "utf-8");
        }
        const descriptor = getDescriptor(filename, options.value);
        let block;
        if (query.type === "script") {
          block = getResolvedScript(descriptor, ssr);
        } else if (query.type === "template") {
          block = descriptor.template;
        } else if (query.type === "style") {
          block = descriptor.styles[query.index];
        } else if (query.index != null) {
          block = descriptor.customBlocks[query.index];
        }
        if (block) {
          return {
            code: block.content,
            map: block.map
          };
        }
      }
    },
    transform: function(code, id, opt) {
      const ssr = opt?.ssr === true;
      const { filename, query } = parseVueRequest(id);
      if (query.raw || query.url) {
        return;
      }
      if (!filter.value(filename) && !query.vue) {
        if (!query.vue && refTransformFilter.value(filename) && options.value.compiler.shouldTransformRef(code)) {
          const result = options.value.compiler.transformRef(code, {
            filename,
            sourceMap: true
          });
          return result;
        }
        return;
      }
      if (!query.vue) {
        return transformMain(
          code,
          filename,
          options.value,
          this,
          ssr,
          customElementFilter.value(filename)
        );
      } else {
        const descriptor = query.src ? getSrcDescriptor(filename, query) || getTempSrcDescriptor(filename, query) : getDescriptor(filename, options.value);
        if (query.type === "template") {
          return transformTemplateAsModule(
            code,
            descriptor,
            options.value,
            this,
            ssr
          );
        } else if (query.type === "style") {
          return transformStyle(
            code,
            descriptor,
            Number(query.index || 0),
            options.value,
            this,
            filename
          );
        }
      }
    },
  },
  {
    name: "uni",
    config: (config, env) => {
      options.command = env.command;
      let base = config.base;
      if (!base) {
          const { h5 } = (0, uni_cli_shared_1.parseManifestJsonOnce)(options.inputDir);
          base = (h5 && h5.router && h5.router.base) || '';
      }
      if (!base) {
          base = '/';
      }
      options.base = base;
      return {
          base: process.env.UNI_H5_BASE || base,
          root: process.env.VITE_ROOT_DIR,
          // TODO 临时设置为__static__,屏蔽警告：https://github.com/vitejs/vite/blob/824d042535033a5c3d7006978c0d05c201cd1c25/packages/vite/src/node/server/middlewares/transform.ts#L125
          publicDir: config.publicDir || '__static__',
          define: (0, define_1.createDefine)(options),
          resolve: (0, resolve_1.createResolve)(options, config),
          logLevel: config.logLevel || 'warn',
          optimizeDeps: (0, optimizeDeps_1.createOptimizeDeps)(options),
          build: (0, build_1.createBuild)(options, config),
          css: (0, css_1.createCss)(options, config),
          esbuild: {
              include: /\.(tsx?|jsx|uts)$/,
              exclude: /\.js$/,
              loader: 'ts',
          },
      };
    },
    configResolved: (config) => {
      // 如果是混合编译且是 nvue 时，部分逻辑无需执行
      if (!(0, uni_cli_shared_1.isInHybridNVue)(config)) {
          (0, env_1.initEnv)(config);
      }
      initLogger(config);
      (0, options_1.initOptions)(options, config);
      (0, plugins_1.initPlugins)(config, options);
      if (!(0, uni_cli_shared_1.isInHybridNVue)(config)) {
          initCheckUpdate();
      }
      if (uni_cli_shared_1.isWindows) {
          // TODO 等 https://github.com/vitejs/vite/issues/3331 修复后，可以移除下列代码
          // 2.8.0 已修复，但为了兼容旧版本，先不移除
          const item = config.resolve.alias.find((item) => !(0, shared_1.isString)(item.find) ? item.find.test('@/') : false);
          if (item) {
              item.customResolver = resolve_1.customResolver;
          }
      }
    },
  },
  {
    name: "uni:cloud",
    enforce: "pre",
    config: function(config, env) {
      if ((0, uni_cli_shared_1.isSsr)(env.command, config)) {
          return;
      }
      const inputDir = process.env.UNI_INPUT_DIR;
      const platform = process.env.UNI_PLATFORM;
      const isSecureNetworkEnabled = (0, uni_cli_shared_1.isEnableSecureNetwork)(inputDir, platform);
      return {
          define: {
              'process.env.UNI_SECURE_NETWORK_ENABLE': isSecureNetworkEnabled,
              'process.env.UNI_SECURE_NETWORK_CONFIG': process.env.UNI_SECURE_NETWORK_CONFIG || JSON.stringify([]),
          },
      };
    },
    transform: function(code, id) {
      if (!opts.filter(id)) {
          return;
      }
      if (uniCloudSpaces.length) {
          return {
              code: code + `;import '@dcloudio/uni-cloud';`,
              map: null,
          };
      }
    },
    configResolved: function (config) {
      opts.resolvedConfig = config;
      const mainPath = (0, utils_1.normalizePath)(path_1.default.resolve(process.env.UNI_INPUT_DIR, 'main'));
      mainJsPath = mainPath + '.js';
      mainTsPath = mainPath + '.ts';
      mainUTsPath = mainPath + '.uts';
      return origConfigResolved && origConfigResolved(config);
    },
  },
  {
    name: "uni:cloud",
    config: function(config) {
      const silent = config.build && config.build.ssr ? true : false;
      if (silent) {
          return;
      }
      const len = uniCloudSpaces.length;
      if (!len) {
          return;
      }
      if ((0, uni_cli_shared_1.isInHybridNVue)(config)) {
          return;
      }
      if (len === 1) {
          console.log(`本项目的uniCloud使用的默认服务空间spaceId为：${uniCloudSpaces[0].id}`);
      }
      if (process.env.UNI_PLATFORM === 'h5' &&
          !process.env.UNI_SUB_PLATFORM &&
          process.env.NODE_ENV === 'production') {
          console.warn('发布到web端需要在uniCloud后台操作，绑定安全域名，否则会因为跨域问题而无法访问。教程参考：https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinh5');
      }
      return {};
    },
    configureServer: function(server) {
      if (server.httpServer) {
          server.httpServer.on('listening', () => {
              process.nextTick(() => {
                  initUniCloudWarningOnce();
              });
          });
      }
      else {
          initUniCloudWarningOnce();
      }
    },
    closeBundle: function() {
      if (process.env.UNI_PLATFORM === 'h5' && !process.env.UNI_SSR_CLIENT) {
          console.log();
          console.log('欢迎将web站点部署到uniCloud前端网页托管平台，高速、免费、安全、省心，详见：https://uniapp.dcloud.io/uniCloud/hosting');
      }
    },
  },
  {
    name: "uni:cloud-inject",
    enforce: "post",
    transform: function(code, id) {
      if (!filter(id))
          return null;
      if (!(0, utils_1.isJsFile)(id))
          return null;
      debugInjectTry(id);
      if (code.search(firstpass) === -1)
          return null;
      if (path_1.sep !== '/')
          id = id.split(path_1.sep).join('/');
      const ast = this.parse(code);
      const imports = new Set();
      ast.body.forEach((node) => {
          if (node.type === 'ImportDeclaration') {
              node.specifiers.forEach((specifier) => {
                  imports.add(specifier.local.name);
              });
          }
      });
      // analyse scopes
      let scope = (0, pluginutils_1.attachScopes)(ast, 'scope');
      const magicString = new magic_string_1.default(code);
      const newImports = new Map();
      function handleReference(node, name, keypath, parent) {
          let mod = modulesMap.get(keypath);
          if (!mod && hasNamespace) {
              const mods = keypath.split('.');
              if (mods.length === 2) {
                  mod = namespaceModulesMap.get(mods[0] + '.');
                  if (mod) {
                      if ((0, shared_1.isArray)(mod)) {
                          const testFn = mod[1];
                          if (testFn(mods[1])) {
                              mod = [mod[0], mods[1]];
                          }
                          else {
                              mod = undefined;
                          }
                      }
                      else {
                          mod = [mod, mods[1]];
                      }
                  }
              }
          }
          if (mod && !imports.has(name) && !scope.contains(name)) {
              if ((0, shared_1.isString)(mod))
                  mod = [mod, 'default'];
              if (mod[0] === id)
                  return false;
              const hash = `${keypath}:${mod[0]}:${mod[1]}`;
              // 当 API 被覆盖定义后，不再摇树
              if (reassignments.has(hash)) {
                  return false;
              }
              if (parent &&
                  (0, utils_1.isAssignmentExpression)(parent) &&
                  parent.left === node) {
                  reassignments.add(hash);
                  return false;
              }
              const importLocalName = name === keypath ? name : (0, pluginutils_1.makeLegalIdentifier)(`$inject_${keypath}`);
              if (!newImports.has(hash)) {
                  if (mod[1] === '*') {
                      newImports.set(hash, `import * as ${importLocalName} from '${mod[0]}';`);
                  }
                  else {
                      newImports.set(hash, `import { ${mod[1]} as ${importLocalName} } from '${mod[0]}';`);
                      callback && callback(newImports, mod);
                  }
              }
              if (name !== keypath) {
                  magicString.overwrite(node.start, node.end, importLocalName, {
                      storeName: true,
                  });
              }
              return true;
          }
          return false;
      }
      (0, estree_walker_1.walk)(ast, {
          enter(node, parent) {
              if (sourceMap) {
                  magicString.addSourcemapLocation(node.start);
                  magicString.addSourcemapLocation(node.end);
              }
              if (node.scope) {
                  scope = node.scope;
              }
              if ((0, utils_1.isProperty)(node) && node.shorthand) {
                  const { name } = node.key;
                  handleReference(node, name, name);
                  this.skip();
                  return;
              }
              if ((0, utils_1.isReference)(node, parent)) {
                  const { name, keypath } = flatten(node);
                  const handled = handleReference(node, name, keypath, parent);
                  if (handled) {
                      this.skip();
                  }
              }
          },
          leave(node) {
              if (node.scope) {
                  scope = scope.parent;
              }
          },
      });
      debugInject(id, newImports.size);
      if (newImports.size === 0) {
          return {
              code,
              // 不能返回 ast ，否则会导致代码不能被再次修改
              // 比如 App.vue 中，console.log('uniCloud') 触发了 inject 检测，检测完，发现不需要
              // 此时返回 ast，会导致 import { setupApp } from '@dcloudio/uni-h5' 不会被编译
              // ast
              map: null,
          };
      }
      const importBlock = Array.from(newImports.values()).join('\n\n');
      magicString.prepend(`${importBlock}\n\n`);
      return {
          code: magicString.toString(),
          map: sourceMap ? magicString.generateMap({ hires: true }) : null,
      };
    },
  },
  {
    name: "uni:cloud-vf",
    enforce: "pre",
    transform: function(code, id) {
      if (id.includes('validator/validateFunction')) {
          return replaceModuleExports(code);
      }
    },
  },
  {
    name: "uni:push",
    enforce: "pre",
    config: function(config, env) {
      if (uniCliShared.isSsr(env.command, config)) {
          return;
      }
      const inputDir = process.env.UNI_INPUT_DIR;
      const platform = process.env.UNI_PLATFORM;
      isEnableV1 = uniCliShared.isEnableUniPushV1(inputDir, platform);
      isEnableV2 = uniCliShared.isEnableUniPushV2(inputDir, platform);
      configModulePush = uniCliShared.hasPushModule(inputDir);
      // v1
      if (isEnableV1) {
          return;
      }
      if (!isEnableV2) {
          return;
      }
      // v2
      isOffline = platform === 'app' && uniCliShared.isUniPushOffline(inputDir);
      if (isOffline) {
          return;
      }
      return {
          define: {
              'process.env.UNI_PUSH_DEBUG': false,
          },
      };
    },
    resolveId: function(id) {
      if (id === '@dcloudio/uni-push') {
          let file = 'dist/uni-push.es.js';
          if (isEnableV1) {
              file = 'dist/uni-push-v1.plus.es.js';
          }
          else if (isOffline) {
              file = 'dist/uni-push.plus.es.js';
          }
          return uniCliShared.resolveBuiltIn(path__default.default.join('@dcloudio/uni-push', file));
      }
    },
    transform: function(code, id) {
      if (!opts.filter(id)) {
          return;
      }
      // 如果启用了v1，但是没有配置module.push，不需要注入
      if (isEnableV1 && !configModulePush) {
          return;
      }
      // 如果启用了v2+offline，但是没有配置module.push，不需要注入
      if (isEnableV2 && isOffline && !configModulePush) {
          return;
      }
      if (isEnableV1 || isEnableV2) {
          return {
              code: `import '@dcloudio/uni-push';` + code,
              map: null,
          };
      }
    },
    configResolved: function (config) {
      opts.resolvedConfig = config;
      const mainPath = (0, utils_1.normalizePath)(path_1.default.resolve(process.env.UNI_INPUT_DIR, 'main'));
      mainJsPath = mainPath + '.js';
      mainTsPath = mainPath + '.ts';
      mainUTsPath = mainPath + '.uts';
      return origConfigResolved && origConfigResolved(config);
    },
  },
  {
    name: "uni:stat",
    enforce: "pre",
    config: function(config, env) {
      const inputDir = process.env.UNI_INPUT_DIR;
      const platform = process.env.UNI_PLATFORM;
      const titlesJson = Object.create(null);
      uniCliShared.parsePagesJson(inputDir, platform).pages.forEach((page) => {
          var _a;
          const style = page.style || {};
          const titleText = 
          // MP
          style.navigationBarTitleText ||
              (
              // H5 || App
              (_a = style.navigationBar) === null || _a === void 0 ? void 0 : _a.titleText) ||
              '';
          if (titleText) {
              titlesJson[page.path] = titleText;
          }
      });
      // ssr 时不开启
      if (!uniCliShared.isSsr(env.command, config)) {
          const statConfig = uniCliShared.getUniStatistics(inputDir, platform);
          isEnable = statConfig.enable === true;
          if (isEnable) {
              const uniCloudConfig = statConfig.uniCloud || {};
              // 获取manifest.json 统计配置，插入环境变量中
              process.env.UNI_STATISTICS_CONFIG = JSON.stringify(statConfig);
              statVersion = Number(statConfig.version) === 2 ? '2' : '1';
              process.env.UNI_STAT_UNI_CLOUD = JSON.stringify(uniCloudConfig);
              process.env.UNI_STAT_DEBUG = statConfig.debug ? 'true' : 'false';
              if (process.env.NODE_ENV === 'production') {
                  const manifestJson = uniCliShared.parseManifestJsonOnce(inputDir);
                  if (!manifestJson.appid) {
                      uniStatLog(uniCliShared.M['stat.warn.appid']);
                      isEnable = false;
                  }
                  else {
                      if (!statConfig.version) {
                          uniStatLog(uniCliShared.M['stat.warn.version']);
                      }
                      else {
                          uniStatLog(`已开启 uni统计${statVersion}.0 版本`);
                          if (statVersion === '2') {
                              uniStatDeviceLog('【重要】因 HBuilderX 3.4.9 版本起，uni统计2.0 调整了安卓端 deviceId 获取方式，导致 uni统计2.0 App-Android平台部分统计数据不准确。如使用了HBuilderX 3.4.9 - 3.6.4版本且开通了uni统计2.0的应用，需要使用HBuilderX3.6.7及以上版本重新发布应用并升级 uniAdmin 云函数解决，详见：https://ask.dcloud.net.cn/article/40097');
                          }
                      }
                  }
              }
              else {
                  if (!statConfig.version) {
                      uniStatLog(uniCliShared.M['stat.warn.version']);
                  }
                  else {
                      uniStatLog(uniCliShared.M['stat.warn.tip'].replace('{version}', `${statVersion}.0`));
                      if (statVersion === '2') {
                          uniStatDeviceLog('【重要】因 HBuilderX 3.4.9 版本起，uni统计2.0 调整了安卓端 deviceId 获取方式，导致 uni统计2.0 App-Android平台部分统计数据不准确。如使用了HBuilderX 3.4.9 - 3.6.4版本且开通了uni统计2.0的应用，需要使用HBuilderX3.6.7及以上版本重新发布应用并升级 uniAdmin 云函数解决，详见：https://ask.dcloud.net.cn/article/40097');
                      }
                  }
              }
          }
          debug__default.default('uni:stat')('isEnable', isEnable);
      }
      process.env.UNI_STAT_TITLE_JSON = JSON.stringify(titlesJson);
      return {
          define: {
              'process.env.UNI_STAT_TITLE_JSON': process.env.UNI_STAT_TITLE_JSON,
              'process.env.UNI_STAT_UNI_CLOUD': process.env.UNI_STAT_UNI_CLOUD,
              'process.env.UNI_STAT_DEBUG': process.env.UNI_STAT_DEBUG,
              'process.env.UNI_STATISTICS_CONFIG': process.env.UNI_STATISTICS_CONFIG,
          },
      };
    },
    resolveId: function(id) {
      return stats[id] || null;
    },
    transform: function(code, id) {
      if (isEnable && opts.filter(id)) {
          return {
              code: code +
                  `;import '@dcloudio/uni${statVersion === '2' ? '-cloud' : ''}-stat';`,
              map: null,
          };
      }
    },
    configResolved: function (config) {
      opts.resolvedConfig = config;
      const mainPath = (0, utils_1.normalizePath)(path_1.default.resolve(process.env.UNI_INPUT_DIR, 'main'));
      mainJsPath = mainPath + '.js';
      mainTsPath = mainPath + '.ts';
      mainUTsPath = mainPath + '.uts';
      return origConfigResolved && origConfigResolved(config);
    },
  },
  {
    name: "uni:mp-lark",
    config: function() {
      return {
          define: {
              __VUE_CREATED_DEFERRED__: true,
          },
          build: {
              // css 中不支持引用本地资源
              assetsInlineLimit: uniCliShared.ASSETS_INLINE_LIMIT,
          },
      };
    },
  },
  {
    name: "uni:mp-main-js",
    enforce: "pre",
    transform: async transform(source, id) {
      if (opts.filter(id)) {
          source = source.includes('createSSRApp')
              ? createApp(source)
              : createLegacyApp(source);
          const inputDir = process.env.UNI_INPUT_DIR;
          const { imports } = await (0, uni_cli_shared_1.updateMiniProgramGlobalComponents)(id, (0, uni_cli_shared_1.parseProgram)(source, id, {
              babelParserPlugins: options.babelParserPlugins,
          }), {
              inputDir,
              resolve: this.resolve,
              normalizeComponentName,
          });
          const { code, map } = await (0, uni_cli_shared_1.transformDynamicImports)(source, imports, {
              id,
              sourceMap: (0, uni_cli_shared_1.withSourcemap)(opts.resolvedConfig),
              dynamicImport: usingComponents_1.dynamicImport,
          });
          return {
              code: `import '\0plugin-vue:export-helper';import 'uni-mp-runtime';import './${uni_cli_shared_1.PAGES_JSON_JS}';` +
                  code,
              map,
          };
      }
    },
    configResolved: function (config) {
      opts.resolvedConfig = config;
      const mainPath = (0, utils_1.normalizePath)(path_1.default.resolve(process.env.UNI_INPUT_DIR, 'main'));
      mainJsPath = mainPath + '.js';
      mainTsPath = mainPath + '.ts';
      mainUTsPath = mainPath + '.uts';
      return origConfigResolved && origConfigResolved(config);
    },
  },
  {
    name: "uni:mp-manifest-json",
    enforce: "pre",
    transform: function(code, id) {
      if (!opts.filter(id)) {
          return;
      }
      this.addWatchFile(path_1.default.resolve(inputDir, 'manifest.json'));
      (0, uni_cli_shared_1.getLocaleFiles)(path_1.default.resolve(inputDir, 'locale')).forEach((filepath) => {
          this.addWatchFile(filepath);
      });
      if (options.project) {
          // 根目录包含指定文件，则直接拷贝
          if (userProjectFilename) {
              this.addWatchFile(userProjectFilename);
              projectJson = (0, uni_cli_shared_1.parseJson)(fs_1.default.readFileSync(userProjectFilename, 'utf8'));
          }
          else {
              const template = options.project.source;
              if ((0, shared_1.hasOwn)(template, 'appid')) {
                  let projectName = path_1.default.basename(inputDir);
                  if (projectName === 'src') {
                      projectName = path_1.default.basename(path_1.default.dirname(inputDir));
                  }
                  template.projectname = projectName;
                  // TODO condition
                  if (process.env.UNI_AUTOMATOR_WS_ENDPOINT) {
                      if (!template.setting) {
                          template.setting = {};
                      }
                      template.setting.urlCheck = false;
                  }
                  projectJson = (0, uni_cli_shared_1.parseMiniProgramProjectJson)(code, platform, {
                      template,
                      pagesJson: (0, uni_cli_shared_1.parsePagesJsonOnce)(inputDir, platform),
                  });
              }
              else {
                  // 无需解析，直接拷贝，如 quickapp-webview
                  projectJson = template;
              }
          }
      }
      return {
          code: '',
          map: { mappings: '' },
      };
    },
    generateBundle: function() {
      if (projectJson && options.project) {
          const { filename, normalize } = options.project;
          const source = JSON.stringify(normalize ? normalize(projectJson) : projectJson, null, 2);
          if (projectSource !== source) {
              projectSource = source;
              this.emitFile({
                  fileName: filename,
                  type: 'asset',
                  source,
              });
          }
      }
    },
    resolveId: function (id, importer, options) {
      const res = origResolveId && origResolveId.call(this, id, importer, options);
      if (res) {
          return res;
      }
      if (id.endsWith(JSON_JS)) {
          return jsonJsPath;
      }
    },
    configResolved: function (config) {
      opts.resolvedConfig = config;
      jsonPath = (0, utils_1.normalizePath)(path_1.default.join(process.env.UNI_INPUT_DIR, name));
      jsonJsPath = (0, utils_1.normalizePath)(path_1.default.join(process.env.UNI_INPUT_DIR, JSON_JS));
      return origConfigResolved && origConfigResolved(config);
    },
    load: function (id, ssr) {
      const res = origLoad && origLoad.call(this, id, ssr);
      if (res) {
          return res;
      }
      if (!opts.filter(id)) {
          return;
      }
      return fs_1.default.readFileSync(jsonPath, 'utf8');
    },
  },
  {
    name: "uni:mp-pages-json",
    enforce: "pre",
    configResolved: function (config) {
      opts.resolvedConfig = config;
      jsonPath = (0, utils_1.normalizePath)(path_1.default.join(process.env.UNI_INPUT_DIR, name));
      jsonJsPath = (0, utils_1.normalizePath)(path_1.default.join(process.env.UNI_INPUT_DIR, JSON_JS));
      return origConfigResolved && origConfigResolved(config);
    },
    transform: function(code, id) {
      if (!opts.filter(id)) {
          return null;
      }
      this.addWatchFile(path_1.default.resolve(inputDir, 'pages.json'));
      (0, uni_cli_shared_1.getLocaleFiles)(path_1.default.resolve(inputDir, 'locale')).forEach((filepath) => {
          this.addWatchFile(filepath);
      });
      const manifestJson = (0, uni_cli_shared_1.parseManifestJsonOnce)(inputDir);
      const { appJson, pageJsons, nvuePages } = (0, uni_cli_shared_1.parseMiniProgramPagesJson)(code, platform, {
          debug: !!manifestJson.debug,
          darkmode: options.app.darkmode,
          networkTimeout: manifestJson.networkTimeout,
          subpackages: !!options.app.subpackages,
          ...options.json,
      });
      nvueCssPathsCache.set(resolvedConfig, nvuePages.map((pagePath) => pagePath + options.style.extname));
      (0, uni_cli_shared_1.mergeMiniProgramAppJson)(appJson, manifestJson[platform]);
      if (options.json?.formatAppJson) {
          options.json.formatAppJson(appJson, manifestJson, pageJsons);
      }
      // 使用 once 获取的话，可以节省编译时间，但 i18n 内容发生变化时，pages.json 不会自动更新
      const i18nOptions = (0, uni_cli_shared_1.initI18nOptionsOnce)(platform, inputDir, false, true);
      if (i18nOptions) {
          const { locale, locales, delimiters } = i18nOptions;
          (0, uni_i18n_1.parseI18nJson)(appJson, locales[locale], delimiters);
          (0, uni_i18n_1.parseI18nJson)(pageJsons, locales[locale], delimiters);
      }
      const { normalize } = options.app;
      (0, uni_cli_shared_1.addMiniProgramAppJson)(normalize ? normalize(appJson) : appJson);
      Object.keys(pageJsons).forEach((name) => {
          if (isNormalPage(name)) {
              (0, uni_cli_shared_1.addMiniProgramPageJson)(name, pageJsons[name]);
          }
      });
      return {
          code: `import './${uni_cli_shared_1.MANIFEST_JSON_JS}'\n` + importPagesCode(appJson),
          map: { mappings: '' },
      };
    },
    generateBundle: function() {
      (0, uni_cli_shared_1.findChangedJsonFiles)(options.app.usingComponents).forEach((value, key) => {
          debugPagesJson('json.changed', key);
          this.emitFile({
              type: 'asset',
              fileName: key + '.json',
              source: value,
          });
      });
    },
    resolveId: function (id, importer, options) {
      const res = origResolveId && origResolveId.call(this, id, importer, options);
      if (res) {
          return res;
      }
      if (id.endsWith(JSON_JS)) {
          return jsonJsPath;
      }
    },
    load: function (id, ssr) {
      const res = origLoad && origLoad.call(this, id, ssr);
      if (res) {
          return res;
      }
      if (!opts.filter(id)) {
          return;
      }
      return fs_1.default.readFileSync(jsonPath, 'utf8');
    },
  },
  {
    name: "uni:virtual",
    enforce: "pre",
    resolveId: function(id) {
      if (isUniPageUrl(id) || isUniComponentUrl(id)) {
          return id;
      }
    },
    load: function(id) {
      if (isUniPageUrl(id)) {
          const filepath = (0, uni_cli_shared_1.normalizePath)(path_1.default.resolve(inputDir, parseVirtualPagePath(id)));
          this.addWatchFile(filepath);
          return {
              code: `import MiniProgramPage from '${filepath}'
      ${global}.createPage(MiniProgramPage)`,
          };
      }
      else if (isUniComponentUrl(id)) {
          const filepath = (0, uni_cli_shared_1.normalizePath)(path_1.default.resolve(inputDir, parseVirtualComponentPath(id)));
          this.addWatchFile(filepath);
          (0, uni_cli_shared_1.addMiniProgramComponentJson)((0, uni_cli_shared_1.removeExt)((0, uni_cli_shared_1.normalizeMiniProgramFilename)(filepath, inputDir)), {
              component: true,
              styleIsolation: process.env.UNI_PLATFORM === 'mp-baidu'
                  ? 'apply-shared'
                  : undefined,
          });
          return {
              code: `import Component from '${filepath}'
      ${global}.createComponent(Component)`,
          };
      }
    },
  },
  {
    name: "uni:mp-inject",
    enforce: "post",
    transform: function(code, id) {
      if (!filter(id))
          return null;
      if (!(0, utils_1.isJsFile)(id))
          return null;
      debugInjectTry(id);
      if (code.search(firstpass) === -1)
          return null;
      if (path_1.sep !== '/')
          id = id.split(path_1.sep).join('/');
      const ast = this.parse(code);
      const imports = new Set();
      ast.body.forEach((node) => {
          if (node.type === 'ImportDeclaration') {
              node.specifiers.forEach((specifier) => {
                  imports.add(specifier.local.name);
              });
          }
      });
      // analyse scopes
      let scope = (0, pluginutils_1.attachScopes)(ast, 'scope');
      const magicString = new magic_string_1.default(code);
      const newImports = new Map();
      function handleReference(node, name, keypath, parent) {
          let mod = modulesMap.get(keypath);
          if (!mod && hasNamespace) {
              const mods = keypath.split('.');
              if (mods.length === 2) {
                  mod = namespaceModulesMap.get(mods[0] + '.');
                  if (mod) {
                      if ((0, shared_1.isArray)(mod)) {
                          const testFn = mod[1];
                          if (testFn(mods[1])) {
                              mod = [mod[0], mods[1]];
                          }
                          else {
                              mod = undefined;
                          }
                      }
                      else {
                          mod = [mod, mods[1]];
                      }
                  }
              }
          }
          if (mod && !imports.has(name) && !scope.contains(name)) {
              if ((0, shared_1.isString)(mod))
                  mod = [mod, 'default'];
              if (mod[0] === id)
                  return false;
              const hash = `${keypath}:${mod[0]}:${mod[1]}`;
              // 当 API 被覆盖定义后，不再摇树
              if (reassignments.has(hash)) {
                  return false;
              }
              if (parent &&
                  (0, utils_1.isAssignmentExpression)(parent) &&
                  parent.left === node) {
                  reassignments.add(hash);
                  return false;
              }
              const importLocalName = name === keypath ? name : (0, pluginutils_1.makeLegalIdentifier)(`$inject_${keypath}`);
              if (!newImports.has(hash)) {
                  if (mod[1] === '*') {
                      newImports.set(hash, `import * as ${importLocalName} from '${mod[0]}';`);
                  }
                  else {
                      newImports.set(hash, `import { ${mod[1]} as ${importLocalName} } from '${mod[0]}';`);
                      callback && callback(newImports, mod);
                  }
              }
              if (name !== keypath) {
                  magicString.overwrite(node.start, node.end, importLocalName, {
                      storeName: true,
                  });
              }
              return true;
          }
          return false;
      }
      (0, estree_walker_1.walk)(ast, {
          enter(node, parent) {
              if (sourceMap) {
                  magicString.addSourcemapLocation(node.start);
                  magicString.addSourcemapLocation(node.end);
              }
              if (node.scope) {
                  scope = node.scope;
              }
              if ((0, utils_1.isProperty)(node) && node.shorthand) {
                  const { name } = node.key;
                  handleReference(node, name, name);
                  this.skip();
                  return;
              }
              if ((0, utils_1.isReference)(node, parent)) {
                  const { name, keypath } = flatten(node);
                  const handled = handleReference(node, name, keypath, parent);
                  if (handled) {
                      this.skip();
                  }
              }
          },
          leave(node) {
              if (node.scope) {
                  scope = scope.parent;
              }
          },
      });
      debugInject(id, newImports.size);
      if (newImports.size === 0) {
          return {
              code,
              // 不能返回 ast ，否则会导致代码不能被再次修改
              // 比如 App.vue 中，console.log('uniCloud') 触发了 inject 检测，检测完，发现不需要
              // 此时返回 ast，会导致 import { setupApp } from '@dcloudio/uni-h5' 不会被编译
              // ast
              map: null,
          };
      }
      const importBlock = Array.from(newImports.values()).join('\n\n');
      magicString.prepend(`${importBlock}\n\n`);
      return {
          code: magicString.toString(),
          map: sourceMap ? magicString.generateMap({ hires: true }) : null,
      };
    },
  },
  {
    name: "uni:mp-renderjs",
    configResolved: function(config) {
      resolvedConfig = config;
      filtersCache.set(resolvedConfig, []);
    },
    transform: function(code, id) {
      const { type, name } = (0, uni_cli_shared_1.parseRenderjs)(id);
      if (!type) {
          return null;
      }
      debugRenderjs(id);
      if (type !== lang) {
          return {
              code: 'export default {}',
              map: { mappings: '' },
          };
      }
      this.addWatchFile((0, uni_cli_shared_1.cleanUrl)(id));
      if (!name) {
          this.error((0, uni_cli_shared_1.missingModuleName)(type, code));
      }
      else {
          let cache = filtersCache.get(resolvedConfig);
          if (cache) {
              const index = cache.findIndex((item) => item.id === id);
              if (index > -1) {
                  cache.splice(index, 1);
              }
              cache.push({
                  id,
                  type,
                  name,
                  code,
              });
          }
      }
      return {
          code: (0, uni_cli_shared_1.genWxsCallMethodsCode)(code),
          map: { mappings: '' },
      };
    },
  },
  {
    name: "uni:mp-runtime-hooks",
    enforce: "post",
    transform: async transform(source, id) {
      const isSetupJs = (0, uni_cli_shared_1.isUniPageSfcFile)(id);
      const isSetupTs = !isSetupJs && (0, uni_cli_shared_1.isUniPageSetupAndTs)(id);
      if (!isSetupJs && !isSetupTs) {
          return null;
      }
      if (isSetupJs && !source.includes('_sfc_main')) {
          return null;
      }
      if (isSetupTs && !source.includes('defineComponent')) {
          return null;
      }
      const matches = source.match(new RegExp(`(${Object.keys(uni_shared_1.MINI_PROGRAM_PAGE_RUNTIME_HOOKS).join('|')})`, 'g'));
      if (!matches) {
          return null;
      }
      if (matches.includes('onShareTimeline')) {
          matches.push('onShareAppMessage');
      }
      const hooks = new Set(matches);
      let flag = 0;
      for (const hook of hooks) {
          flag |= uni_shared_1.MINI_PROGRAM_PAGE_RUNTIME_HOOKS[hook];
      }
      if (isSetupJs) {
          source = source + `;_sfc_main.__runtimeHooks = ${flag};`;
      }
      else if (isSetupTs) {
          source =
              (0, compiler_sfc_1.rewriteDefault)(source, '_sfc_defineComponent') +
                  `\n_sfc_defineComponent.__runtimeHooks = ${flag};\nexport default _sfc_defineComponent`;
      }
      return {
          code: source,
          map: { mappings: '' },
      };
    },
  },
  {
    name: "uni:mp",
    uni: {
      copyOptions: {
        assets: [
          "ttcomponents",
        ],
        targets: [
          {
            src: [
              "ext.json",
            ],
            dest: "/Users/otto/mycode/dcloud/basic-vue3/dist/dev/mp-lark",
          },
        ],
      },
      compiler: {
        findProp: function findProp(node, name, dynamicOnly = false, allowEmpty = false) {
          for (let i = 0; i < node.props.length; i++) {
              const p = node.props[i];
              if (p.type === 6 /* NodeTypes.ATTRIBUTE */) {
                  if (dynamicOnly)
                      continue;
                  if (p.name === name && (p.value || allowEmpty)) {
                      return p;
                  }
              }
              else if (p.name === 'bind' &&
                  (p.exp || allowEmpty) &&
                  isStaticArgOf(p.arg, name)) {
                  return p;
              }
          }
        },
        genExpr: function genExpr(node, context) {
          return genNode(node, context).code;
        },
        rewriteExpression: function rewriteExpression(node, context, babelNode, scope = context.currentScope, { property, ignoreLiteral, referencedScope, } = {
          property: true,
          ignoreLiteral: false,
          }) {
          if (node.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */ && node.isStatic) {
              return node;
          }
          if (!babelNode) {
              const code = (0, codegen_1.genExpr)(node);
              babelNode = (0, ast_1.parseExpr)(code, context, node);
              if (!babelNode) {
                  return (0, compiler_core_1.createSimpleExpression)(code);
              }
          }
          if (!ignoreLiteral && isStaticLiteral(babelNode)) {
              return node;
          }
          if ((0, ast_1.isUndefined)(babelNode)) {
              return (0, compiler_core_1.createSimpleExpression)('undefined', false, node.loc);
          }
          // wxs 等表达式
          if (context.filters?.length) {
              if (isReferencedByIds(babelNode, context.filters)) {
                  return (0, compiler_core_1.createSimpleExpression)((0, codegen_1.genExpr)(node), false, node.loc);
              }
          }
          referencedScope = referencedScope || findReferencedScope(babelNode, scope);
          const id = referencedScope.id.next();
          if (property) {
              referencedScope.properties.push((0, types_1.objectProperty)((0, types_1.identifier)(id), babelNode));
          }
          // 在 v-for 中包含的 v-if 块，所有变量需要补充当前 v-for value 前缀
          if ((0, transform_1.isVIfScope)(referencedScope)) {
              if ((0, transform_1.isVForScope)(referencedScope.parentScope)) {
                  return (0, compiler_core_1.createSimpleExpression)(referencedScope.parentScope.valueAlias + '.' + id);
              }
              return (0, compiler_core_1.createSimpleExpression)(id);
          }
          else if ((0, transform_1.isVForScope)(referencedScope)) {
              return (0, compiler_core_1.createSimpleExpression)(referencedScope.valueAlias + '.' + id);
          }
          return (0, compiler_core_1.createSimpleExpression)(id);
        },
        isForElementNode: function isForElementNode(node) {
          return !!node.vFor;
        },
        transformOn: (dir, node, _context, augmentor) => {
          const context = _context;
          const { loc, modifiers, arg } = dir;
          if (!dir.exp && !modifiers.length) {
              context.onError((0, compiler_core_1.createCompilerError)(35 /* ErrorCodes.X_V_ON_NO_EXPRESSION */, loc));
          }
          let eventName;
          if (arg.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */) {
              if (arg.isStatic) {
                  const rawName = arg.content;
                  // for all event listeners, auto convert it to camelCase. See issue #2249
                  eventName = (0, compiler_core_1.createSimpleExpression)((0, shared_1.toHandlerKey)((0, shared_1.camelize)(rawName)), true, arg.loc);
              }
              else {
                  // #2388
                  eventName = (0, compiler_core_1.createCompoundExpression)([
                      // `${context.helperString(TO_HANDLER_KEY)}(`,
                      arg,
                      // `)`,
                  ]);
              }
          }
          else {
              // already a compound expression.
              eventName = arg;
              eventName.children.unshift(`${context.helperString(compiler_core_1.TO_HANDLER_KEY)}(`);
              eventName.children.push(`)`);
          }
          // handler processing
          let exp = dir.exp;
          if (exp && !exp.content.trim()) {
              exp = undefined;
          }
          let shouldCache = context.cacheHandlers && !exp && !context.inVOnce;
          if (exp) {
              const isMemberExp = (0, compiler_core_1.isMemberExpression)(exp.content, context);
              const isInlineStatement = !(isMemberExp || fnExpRE.test(exp.content));
              const hasMultipleStatements = exp.content.includes(`;`);
              // process the expression since it's been skipped
              if (context.prefixIdentifiers) {
                  isInlineStatement && context.addIdentifiers(`$event`);
                  exp = dir.exp = (0, transformExpression_1.processExpression)(exp, context, false, hasMultipleStatements);
                  isInlineStatement && context.removeIdentifiers(`$event`);
                  // with scope analysis, the function is hoistable if it has no reference
                  // to scope variables.
                  shouldCache =
                      context.cacheHandlers &&
                          // unnecessary to cache inside v-once
                          !context.inVOnce &&
                          // runtime constants don't need to be cached
                          // (this is analyzed by compileScript in SFC <script setup>)
                          !(exp.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */ && exp.constType > 0) &&
                          // #1541 bail if this is a member exp handler passed to a component -
                          // we need to use the original function to preserve arity,
                          // e.g. <transition> relies on checking cb.length to determine
                          // transition end handling. Inline function is ok since its arity
                          // is preserved even when cached.
                          !(isMemberExp && node.tagType === 1 /* ElementTypes.COMPONENT */) &&
                          // bail if the function references closure variables (v-for, v-slot)
                          // it must be passed fresh to avoid stale values.
                          !(0, compiler_core_1.hasScopeRef)(exp, context.identifiers) &&
                          // wxs event
                          !isFilterExpr(exp, context);
                  // If the expression is optimizable and is a member expression pointing
                  // to a function, turn it into invocation (and wrap in an arrow function
                  // below) so that it always accesses the latest value when called - thus
                  // avoiding the need to be patched.
                  if (shouldCache && isMemberExp) {
                      if (exp.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */) {
                          exp.content = `${exp.content} && ${exp.content}(...args)`;
                      }
                      else {
                          exp.children = [...exp.children, ` && `, ...exp.children, `(...args)`];
                      }
                  }
              }
              if (isInlineStatement || (shouldCache && isMemberExp)) {
                  // wrap inline statement in a function expression
                  exp = (0, compiler_core_1.createCompoundExpression)([
                      `${isInlineStatement
                          ? context.isTS
                              ? `($event: any)`
                              : `$event`
                          : `${context.isTS ? `\n//@ts-ignore\n` : ``}(...args)`} => ${hasMultipleStatements ? `{` : `(`}`,
                      exp,
                      hasMultipleStatements ? `}` : `)`,
                  ]);
              }
          }
          let ret = {
              props: [
                  (0, compiler_core_1.createObjectProperty)(eventName, exp || (0, compiler_core_1.createSimpleExpression)(`() => {}`, false, loc)),
              ],
          };
          // apply extended compiler augmentor
          if (augmentor) {
              ret = augmentor(ret);
          }
          // TODO
          if (shouldCache) {
              // cache handlers so that it's always the same handler being passed down.
              // this avoids unnecessary re-renders when users use inline handlers on
              // components.
              // ret.props[0].value = wrapper(
              //   context.cache(ret.props[0].value) as ExpressionNode,
              //   context
              // )
              ret.props[0].value = wrapperVOn(ret.props[0].value, node, context);
          }
          else {
              ret.props[0].value = wrapperVOn(ret.props[0].value, node, context);
          }
          // mark the key as handler for props normalization check
          ret.props.forEach((p) => (p.key.isHandlerKey = true));
          return ret;
        },
        transformModel: (dir, node, _context) => {
          const context = _context;
          const baseResult = (0, compiler_core_1.transformModel)(dir, node, _context);
          // base transform has errors OR component v-model (only need props)
          if (!baseResult.props.length || node.tagType === 1 /* ElementTypes.COMPONENT */) {
              return transformComponentVModel(baseResult.props, node, context);
          }
          if (dir.arg) {
              context.onError((0, compiler_dom_1.createDOMCompilerError)(56 /* DOMErrorCodes.X_V_MODEL_ARG_ON_ELEMENT */, dir.arg.loc));
          }
          function checkDuplicatedValue() {
              const value = (0, compiler_core_1.findProp)(node, 'value');
              if (value) {
                  context.onError((0, compiler_dom_1.createDOMCompilerError)(58 /* DOMErrorCodes.X_V_MODEL_UNNECESSARY_VALUE */, value.loc));
              }
          }
          const { tag } = node;
          if (tag === 'input' || tag === 'textarea') {
              checkDuplicatedValue();
          }
          else {
              context.onError((0, compiler_dom_1.createDOMCompilerError)(55 /* DOMErrorCodes.X_V_MODEL_ON_INVALID_ELEMENT */, dir.loc));
          }
          if (dir.modifiers.length) {
              const arg = dir.arg;
              const modifiers = dir.modifiers
                  .map((m) => ((0, compiler_core_1.isSimpleIdentifier)(m) ? m : JSON.stringify(m)) + `: true`)
                  .join(`, `);
              const modifiersKey = arg
                  ? (0, compiler_core_1.isStaticExp)(arg)
                      ? `${arg.content}Modifiers`
                      : (0, compiler_core_1.createCompoundExpression)([arg, ' + "Modifiers"'])
                  : `modelModifiers`;
              baseResult.props.push((0, compiler_core_1.createObjectProperty)(modifiersKey, (0, compiler_core_1.createSimpleExpression)(`{ ${modifiers} }`, false, dir.loc, 2 /* ConstantTypes.CAN_HOIST */)));
          }
          return transformElementVModel(baseResult.props, node, context);
        },
        parse: function parse(template, options = {}) {
          return (0, compiler_core_1.baseParse)(template, (0, shared_1.extend)({}, parserOptions_1.parserOptions, options));
        },
        compile: function compile(template, options = {}) {
          return (0, compile_1.baseCompile)(template, (0, shared_1.extend)({}, parserOptions_1.parserOptions, options, {
              directiveTransforms: (0, shared_1.extend)({}, options.directiveTransforms || {}),
          }));
        },
        V_ON: Symbol(vOn),
        V_FOR: Symbol(vFor),
        EXTEND: Symbol(extend),
        SET_REF: Symbol(setRef),
        CAMELIZE: Symbol(camelize),
        HYPHENATE: Symbol(hyphenate),
        RENDER_PROPS: Symbol(renderProps),
        RENDER_SLOT: Symbol(renderSlot),
        DYNAMIC_SLOT: Symbol(dynamicSlot),
        WITH_SCOPED_SLOT: Symbol(withScopedSlot),
        STRINGIFY_STYLE: Symbol(stringifyStyle),
        NORMALIZE_CLASS: Symbol(normalizeClass),
        TO_DISPLAY_STRING: Symbol(toDisplayString),
        WITH_MODEL_MODIFIERS: Symbol(withModelModifiers),
      },
      compilerOptions: {
        root: "/Users/otto/mycode/dcloud/basic-vue3/src",
        miniProgram: {
          event: undefined,
          class: {
            array: false,
          },
          filter: {
            lang: "sjs",
          },
          directive: "tt:",
          lazyElement: undefined,
          component: {
            dir: "ttcomponents",
            vShow: "bind:-data-c-h",
            mergeVirtualHostAttributes: undefined,
          },
          emitFile: (emittedFile) => {
            if (emittedFile.type === 'asset') {
                const filename = emittedFile.fileName;
                (0, uni_cli_shared_1.addMiniProgramTemplateFile)((0, uni_cli_shared_1.removeExt)((0, uni_cli_shared_1.normalizeMiniProgramFilename)(path_1.default.relative(process.env.UNI_INPUT_DIR, filename))), emittedFile.source.toString());
                debugTemplate(filename);
                return filename;
            }
            return '';
          },
          slot: {
            fallbackContent: false,
            dynamicSlotNames: false,
          },
        },
        isNativeTag: function isMiniProgramNativeTag(tag) {
          return isBuiltInComponent(tag);
        },
        isCustomElement: function isCustomElement(tag) {
          return tags.includes(tag);
        },
        nodeTransforms: [
          (node, context) => {
            // 发现是page-meta下的head,直接remove该节点
            (0, utils_1.checkElementNodeTag)(node, 'head') &&
                (0, utils_1.checkElementNodeTag)(context.parent, 'page-meta') &&
                context.removeNode(node);
          },
          function transformRef(node, context) {
            if (!(0, utils_1.isUserComponent)(node, context)) {
                return;
            }
            addVueRef(node, context);
          },
          function transformSwiper(node) {
            if (node.type !== 1 /* NodeTypes.ELEMENT */ || node.tag !== 'swiper') {
                return;
            }
            const disableTouchProp = compilerCore.findProp(node, 'disable-touch', false, true);
            if (!disableTouchProp) {
                return;
            }
            const { props } = node;
            if (disableTouchProp.type === 6 /* NodeTypes.ATTRIBUTE */) {
                // <swiper disable-touch/> => <swiper :touchable="false"/>
                props.splice(props.indexOf(disableTouchProp), 1, uniCliShared.createBindDirectiveNode('touchable', 'false'));
            }
            else {
                if (disableTouchProp.exp) {
                    // <swiper :disable-touch="true"/> => <swiper :touchable="!(true)"/>
                    let touchable = '';
                    if (disableTouchProp.exp.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */) {
                        if (disableTouchProp.exp.content === 'true') {
                            touchable = 'false';
                        }
                        else if (disableTouchProp.exp.content === 'false') {
                            touchable = 'true';
                        }
                    }
                    props.splice(props.indexOf(disableTouchProp), 1, uniCliShared.createBindDirectiveNode('touchable', touchable || `!(${uniMpCompiler.genExpr(disableTouchProp.exp)})`));
                }
            }
          },
          function transformTag(node, context) {
            if (!(0, ast_1.isElementNode)(node)) {
                return;
            }
            const oldTag = node.tag;
            const newTag = opts[oldTag];
            if (!newTag) {
                return;
            }
            node.tag = newTag;
          },
          function transformComponentLink(node, context) {
            if (!(0, utils_1.isUserComponent)(node, context)) {
                return;
            }
            if (type === 7 /* NodeTypes.DIRECTIVE */) {
                node.props.push({
                    type: 7 /* NodeTypes.DIRECTIVE */,
                    name: 'on',
                    modifiers: [],
                    loc: compiler_core_1.locStub,
                    arg: (0, compiler_core_1.createSimpleExpression)(name, true),
                    exp: (0, compiler_core_1.createSimpleExpression)('__l', true),
                });
            }
            else {
                node.props.push((0, utils_1.createAttributeNode)(name, '__l'));
            }
          },
        ],
      },
    },
    config: function() {
      return {
          base: '/',
          resolve: {
              alias: {
                  vue: (0, uni_cli_shared_1.resolveBuiltIn)('@dcloudio/uni-mp-vue'),
                  '@vue/devtools-api': (0, uni_cli_shared_1.resolveBuiltIn)('@dcloudio/uni-mp-vue'),
                  'vue-i18n': (0, uni_cli_shared_1.resolveVueI18nRuntime)(),
                  ...alias,
              },
              preserveSymlinks: true,
          },
          css: {
              postcss: {
                  plugins: (0, uni_cli_shared_1.initPostcssPlugin)({
                      uniApp: (0, uni_cli_shared_1.parseRpx2UnitOnce)(process.env.UNI_INPUT_DIR, process.env.UNI_PLATFORM),
                  }),
              },
          },
          optimizeDeps: {
              disabled: true,
          },
          build: (0, build_1.buildOptions)(),
      };
    },
    configResolved: function(config) {
      resolvedConfig = config;
      return (0, configResolved_1.createConfigResolved)(options)(config);
    },
    generateBundle: function() {
      if (template.filter) {
          const extname = template.filter.extname;
          const filterFiles = (0, template_1.getFilterFiles)(resolvedConfig, this.getModuleInfo);
          Object.keys(filterFiles).forEach((filename) => {
              const { code } = filterFiles[filename];
              this.emitFile({
                  type: 'asset',
                  fileName: filename + extname,
                  source: code,
              });
          });
      }
      const templateFiles = (0, template_1.getTemplateFiles)(template);
      Object.keys(templateFiles).forEach((filename) => {
          this.emitFile({
              type: 'asset',
              fileName: filename + template.extname,
              source: templateFiles[filename],
          });
      });
      if (!nvueCssEmitted) {
          const nvueCssPaths = (0, pagesJson_1.getNVueCssPaths)(resolvedConfig);
          if (nvueCssPaths && nvueCssPaths.length) {
              nvueCssEmitted = true;
              this.emitFile({
                  type: 'asset',
                  fileName: 'nvue' + style.extname,
                  source: (0, uni_cli_shared_1.genNVueCssCode)((0, uni_cli_shared_1.parseManifestJsonOnce)(process.env.UNI_INPUT_DIR)),
              });
          }
      }
    },
  },
  {
    name: "uni:mp-using-component",
    enforce: "post",
    configResolved: function(config) {
      resolvedConfig = config;
    },
    transform: async transform(source, id) {
      const { filename, query } = (0, uni_cli_shared_1.parseVueRequest)(id);
      if (filename.endsWith('App.vue')) {
          return null;
      }
      const sourceMap = (0, uni_cli_shared_1.withSourcemap)(resolvedConfig);
      const dynamicImportOptions = {
          id,
          sourceMap,
          dynamicImport,
      };
      const resolve = async (source, importer, options) => {
          const id = (0, uni_cli_shared_1.resolveUTSModule)(source, importer || process.env.UNI_INPUT_DIR);
          if (id) {
              source = id;
          }
          return this.resolve(source, importer, options);
      };
      if (query.vue) {
          if (query.type === 'script') {
              // 需要主动监听
              this.addWatchFile(filename);
              const descriptor = await (0, uni_cli_shared_1.parseScriptDescriptor)(filename, parseAst(source, id), {
                  resolve,
                  isExternal: true,
              });
              (0, uni_cli_shared_1.updateMiniProgramComponentsByScriptFilename)(filename, inputDir, normalizeComponentName);
              return (0, uni_cli_shared_1.transformDynamicImports)(source, descriptor.imports, dynamicImportOptions);
          }
          else if (query.type === 'template') {
              // 需要主动监听
              this.addWatchFile(filename);
              const descriptor = await (0, uni_cli_shared_1.parseTemplateDescriptor)(filename, parseAst(source, id), {
                  resolve,
                  isExternal: true,
              });
              (0, uni_cli_shared_1.updateMiniProgramComponentsByTemplateFilename)(filename, inputDir, normalizeComponentName);
              return (0, uni_cli_shared_1.transformDynamicImports)(source, descriptor.imports, dynamicImportOptions);
          }
          return null;
      }
      if (!uni_cli_shared_1.EXTNAME_VUE.includes(path_1.default.extname(filename))) {
          return null;
      }
      const ast = parseAst(source, id);
      const descriptor = await (0, uni_cli_shared_1.parseMainDescriptor)(filename, ast, resolve);
      (0, uni_cli_shared_1.updateMiniProgramComponentsByMainFilename)(filename, inputDir, normalizeComponentName);
      return (0, uni_cli_shared_1.transformDynamicImports)(source, descriptor.imports, dynamicImportOptions);
    },
  },
  {
    name: "uni:copy",
    apply: "build",
    configResolved: function(config) {
      resolvedConfig = config;
    },
    writeBundle: function() {
      if (initialized) {
          return;
      }
      if (resolvedConfig.build.ssr) {
          return;
      }
      initialized = true;
      return new Promise((resolve) => {
          Promise.all(targets.map(({ watchOptions, ...target }) => {
              return new Promise((resolve) => {
                  new watcher_1.FileWatcher({
                      verbose,
                      ...target,
                  }).watch({
                      cwd: process.env.UNI_INPUT_DIR,
                      ...watchOptions,
                  }, (watcher) => {
                      if (process.env.NODE_ENV !== 'development') {
                          // 生产模式下，延迟 close，否则会影响 chokidar 初始化的 add 等事件
                          setTimeout(() => {
                              watcher.close().then(() => resolve(void 0));
                          }, 2000);
                      }
                      else {
                          resolve(void 0);
                      }
                  }, () => {
                      // TODO 目前初始化编译时，也会不停地触发此函数。
                      (0, logs_1.output)('log', messages_1.M['dev.watching.end']);
                  });
              });
          })).then(() => resolve());
      });
    },
  },
]