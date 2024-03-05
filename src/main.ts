// https://code.visualstudio.com/api/references/theme-color
import fs from "fs";
import { colord } from "./colord";
import * as ANSI from "ansi-colors";
import { ThemeUIColors } from "./types";

const transparent = "#00000000";

// WCAG AA minimum contrast values
// https://webaim.org/resources/contrastchecker/
const Contrast = {
  text: 4.5,
  ui: 3,
  // Not a WCAG value
  decoration: 1.2,
} as const;
type ContrastLevel = keyof typeof Contrast;

// Sort the JSON object so things always come out in the same order, and minor
// refactoring doesn't cause the build files to change
function sortedObject<TObj extends Record<string, any>>(obj: TObj): TObj {
  const ret: any = {};
  for (const key of Object.keys(obj).sort()) {
    ret[key] = obj[key];
  }
  return ret;
}

type FontStyle = "bold" | "italic" | "underline" | "strikethrough";

interface TokenSettingColor {
  fontStyle?: FontStyle;
  foreground: string;
}

interface TokenSettingStyle {
  fontStyle: FontStyle;
}

type TokenSetting = TokenSettingColor | TokenSettingStyle;

interface TokenColor {
  name?: string;
  scope: string | string[];
  settings: TokenSetting;
}

const hue = {
  bg: 160,
  uno: 85,
  due: 20,
  tre: 330,
} as const;

const ui = {
  bg0: hsl(hue.bg, 50, 14),
  bg1: hsl(hue.bg, 50, 17),

  fg: hsl(hue.bg, 65, 85),

  border0: hsl(hue.bg, 50, 25),
  border1: hsl(hue.bg, 50, 45),

  link: hsl(hue.uno, 90, 50),

  accent0: hsl(hue.tre, 90, 80),
  accent1: hsl(hue.due, 90, 80),

  bracket1: hsl(hue.uno, 40, 50),
  bracket2: hsl(hue.due, 40, 60),
  bracket3: hsl(hue.tre, 30, 65),

  error: "#ff6666",
} as const;

const syntax = {
  default: ui.fg,

  alt0: hsl(hue.bg, 15, 60),
  alt1: hsl(hue.bg, 40, 48),

  uno0: hsl(hue.uno, 80, 80),
  uno1: hsl(hue.uno, 70, 60),

  due0: hsl(hue.due, 100, 90),
  due1: hsl(hue.due, 85, 80),
  due2: hsl(hue.due, 90, 60),

  tre0: hsl(hue.tre, 100, 90),
  tre1: hsl(hue.tre, 85, 80),
  tre2: hsl(hue.tre, 90, 70),
} as const;

const terminal = {
  black: hsl(hue.bg, 35, 25),
  red: hsl(hue.tre, 80, 70),
  green: hsl(hue.uno, 90, 70),
  yellow: hsl(hue.due, 80, 70),
  blue: hsl(220, 90, 70),
  magenta: hsl(290, 80, 70),
  cyan: hsl(180, 90, 70),
  white: hsl(hue.due, 30, 90),
} as const;

const diff = {
  red: hsl(340, 100, 30),
  blue: hsl(220, 100, 30),
} as const;

const bg = {
  orange: lch(40, 65, 65),
  yellow: lch(40, 65, 100),
  blue: lch(40, 65, 270),
  purple: lch(40, 65, 330),
} as const;

/** Only use LCH for colors I don't care about as much. */
function lch(l: number, c: number, h: number): string {
  return colord({ l, c, h }).toHex();
}

/** Lovingly hand picked colors use HSL, at least until OKLCH is available. */
function hsl(h: number, s: number, l: number): string {
  return colord({ h, s, l }).toHex();
}

/**
 * This isn't a great practice, but VS Code forces us to use transparent colors
 * in certain scenarios. Limit this to those, please.
 */
function alpha(color: string, percent: number): string {
  const rgb = colord(color).toRgb();
  rgb.a = percent / 100;
  return colord(rgb).toHex();
}

function config(): {
  /** Base theme (e.g. light/dark/high contrast) */
  type: string;
  /** UI colors */
  colors: ThemeUIColors;
  /** Syntax highlighting colors */
  tokenColors: TokenColor[];
} {
  return {
    type: "dark",
    colors: sortedObject(colors()),
    tokenColors: tokenColors(),
  };
}

function themeActivityBar(): ThemeUIColors {
  return {
    "activityBar.border": ui.border0,
    "activityBar.background": ui.bg1,
    "activityBar.foreground": ui.accent0,
    "activityBar.inactiveForeground": ui.fg,
    "activityBarBadge.background": ui.accent1,
    "activityBarBadge.foreground": ui.bg0,
    "activityBar.activeBorder": ui.accent0,
    "activityBar.activeBackground": transparent,

    "activityBarTop.activeBorder": ui.accent0,
    "activityBarTop.dropBorder": ui.accent0,
    "activityBarTop.foreground": ui.accent0,
    "activityBarTop.inactiveForeground": ui.fg,
  };
}

function themeNotifications(): ThemeUIColors {
  return {
    "notificationCenter.border": undefined,
    "notificationCenterHeader.foreground": ui.fg,
    "notificationCenterHeader.background": ui.bg1,
    "notificationToast.border": ui.border0,
    "notifications.foreground": ui.fg,
    "notifications.background": ui.bg1,
    "notifications.border": undefined,
    "notificationLink.foreground": syntax.alt1,
  };
}

function themeList(): ThemeUIColors {
  return {
    "quickInput.background": ui.bg1,

    "list.errorForeground": terminal.red,
    "list.warningForeground": terminal.yellow,
    "list.highlightForeground": ui.accent0,

    "list.focusForeground": ui.fg,
    "list.focusHighlightForeground": ui.bg0,

    "list.activeSelectionIconForeground": ui.bg0,
    "list.activeSelectionForeground": ui.bg0,
    "list.activeSelectionBackground": ui.fg,

    "list.inactiveSelectionIconForeground": ui.fg,
    "list.inactiveSelectionForeground": ui.fg,
    "list.inactiveSelectionBackground": ui.bg0,

    "quickInputList.focusIconForeground": ui.bg0,
    "quickInputList.focusForeground": ui.bg0,
    "quickInputList.focusBackground": ui.fg,

    "list.hoverBackground": alpha(ui.border1, 25),
  };
}

function themeWelcome(): ThemeUIColors {
  return {
    "textLink.foreground": ui.link,
    "textLink.activeForeground": ui.link,
    "textBlockQuote.background": transparent,
    "textBlockQuote.border": syntax.default,
    "textPreformat.foreground": syntax.due1,
  };
}

function themeSettings(): ThemeUIColors {
  return {
    "settings.headerForeground": syntax.uno1,
    "settings.rowHoverBackground": alpha(ui.bg1, 25),
    "settings.modifiedItemIndicator": syntax.due1,
    "settings.dropdownBackground": ui.bg1,
    "settings.checkboxBackground": ui.bg1,
    "settings.textInputBackground": ui.bg1,
    "settings.numberInputBackground": ui.bg1,
  };
}

function themeTerminal(): ThemeUIColors {
  return {
    "terminal.foreground": ui.fg,
    "terminal.background": ui.bg0,
    "terminal.ansiBlack": terminal.black,
    "terminal.ansiBlue": terminal.blue,
    "terminal.ansiBrightBlack": terminal.black,
    "terminal.ansiBrightBlue": terminal.blue,
    "terminal.ansiBrightCyan": terminal.cyan,
    "terminal.ansiBrightGreen": terminal.green,
    "terminal.ansiBrightMagenta": terminal.magenta,
    "terminal.ansiBrightRed": terminal.red,
    "terminal.ansiBrightWhite": terminal.white,
    "terminal.ansiBrightYellow": terminal.yellow,
    "terminal.ansiCyan": terminal.cyan,
    "terminal.ansiGreen": terminal.green,
    "terminal.ansiMagenta": terminal.magenta,
    "terminal.ansiRed": terminal.red,
    "terminal.ansiWhite": terminal.white,
    "terminal.ansiYellow": terminal.yellow,
  };
}

function themeDiff(): ThemeUIColors {
  return {
    "diffEditor.insertedTextBackground": alpha(diff.blue, 25),
    // "diffEditor.insertedTextBorder": undefined,
    "diffEditor.removedTextBackground": alpha(diff.red, 25),
    // "diffEditor.removedTextBorder": undefined,
    "diffEditor.border": ui.border0,
    "diffEditor.diagonalFill": alpha(syntax.default, 10),
    "diffEditor.insertedLineBackground": alpha(diff.blue, 25),
    "diffEditor.removedLineBackground": alpha(diff.red, 25),
    "diffEditorGutter.insertedLineBackground": alpha(diff.blue, 25),
    "diffEditorGutter.removedLineBackground": alpha(diff.red, 25),
    "diffEditorOverview.insertedForeground": terminal.blue,
    "diffEditorOverview.removedForeground": terminal.red,
  };
}

function themeMerge(): ThemeUIColors {
  return {
    // Current header background in inline merge conflicts.
    "merge.currentHeaderBackground": alpha(diff.blue, 65),
    // Current content background in inline merge conflicts.
    "merge.currentContentBackground": alpha(diff.blue, 25),
    // Incoming header background in inline merge conflicts.
    "merge.incomingHeaderBackground": alpha(diff.red, 65),
    // Incoming content background in inline merge conflicts.
    "merge.incomingContentBackground": alpha(diff.red, 25),
    // Border color on headers and the splitter in inline merge conflicts.
    "merge.border": undefined,
    // Common ancestor content background in inline merge-conflicts.
    "merge.commonContentBackground": undefined,
    // Common ancestor header background in inline merge-conflicts.
    "merge.commonHeaderBackground": undefined,
  };
}

function themeGit(): ThemeUIColors {
  return {
    "gitDecoration.modifiedResourceForeground": terminal.blue,
    "gitDecoration.deletedResourceForeground": terminal.red,
    "gitDecoration.untrackedResourceForeground": terminal.magenta,
    "gitDecoration.conflictingResourceForeground": terminal.cyan,
    "gitDecoration.ignoredResourceForeground": alpha(ui.fg, 40),
  };
}

function themeStatusBar(): ThemeUIColors {
  return {
    "statusBar.border": ui.border0,
    "statusBarItem.activeBackground": alpha(ui.border1, 40),
    "statusBarItem.hoverBackground": alpha(ui.border1, 20),
    "statusBarItem.remoteForeground": ui.fg,
    "statusBarItem.remoteBackground": ui.bg1,
    "statusBarItem.remoteHoverForeground": ui.fg,
    "statusBarItem.remoteHoverBackground": alpha(ui.border1, 20),
    "statusBar.background": ui.bg1,
    "statusBar.debuggingBackground": ui.bg1,
    "statusBar.noFolderBackground": ui.bg1,
    "statusBar.foreground": ui.fg,
  };
}

function themeBadge(): ThemeUIColors {
  return {
    "badge.foreground": ui.bg0,
    "badge.background": ui.accent1,
  };
}

function themeMenu(): ThemeUIColors {
  return {
    "menu.background": ui.bg1,
    "menu.foreground": ui.fg,
    "menu.separatorBackground": ui.border0,
    "menu.border": ui.border0,
  };
}

function themeKeybinding(): ThemeUIColors {
  return {
    "keybindingLabel.background": transparent,
    "keybindingLabel.foreground": ui.fg,
    "keybindingLabel.border": ui.border0,
    "keybindingLabel.bottomBorder": ui.border0,
  };
}

function themeHighlightBorders(): ThemeUIColors {
  return {
    "editor.selectionHighlightBorder": undefined,
    "editor.wordHighlightBorder": undefined,
    "editor.wordHighlightStrongBorder": undefined,
    "editor.findMatchBorder": undefined,
    "editor.findMatchHighlightBorder": undefined,
    "editor.findRangeHighlightBorder": undefined,
    "editor.rangeHighlightBorder": undefined,
  };
}

function themeScrollbar(): ThemeUIColors {
  return {
    "scrollbar.shadow": transparent,
    "scrollbarSlider.background": alpha(ui.border1, 40),
    "scrollbarSlider.hoverBackground": alpha(ui.border1, 50),
    "scrollbarSlider.activeBackground": alpha(ui.border1, 60),
  };
}

function themeDropdown(): ThemeUIColors {
  return {
    "dropdown.background": ui.bg0,
    "dropdown.listBackground": ui.bg0,
    "dropdown.border": ui.border1,
    "dropdown.foreground": ui.fg,
  };
}

function themeDragAndDrop(): ThemeUIColors {
  const color = alpha(syntax.due2, 30);
  return {
    "list.dropBackground": color,
    "sideBar.dropBackground": color,
    "editorGroup.dropBackground": color,
    "panel.border": ui.border0,
    "panelSection.border": ui.border0,
    "panelSectionHeader.border": ui.border0,
  };
}

function themeButton(): ThemeUIColors {
  return {
    "button.border": ui.fg,
    "button.background": ui.fg,
    "button.foreground": ui.bg0,
    "button.hoverBackground": alpha(ui.fg, 95),
    "button.separator": alpha(ui.bg0, 30),
    "button.secondaryBackground": ui.bg0,
    "button.secondaryForeground": ui.fg,
    "button.secondaryHoverBackground": alpha(ui.bg0, 95),
  };
}

function themeBracketColors(): ThemeUIColors {
  ////////////////////////////////////////////////////////////////////////////
  //
  // Code just for looking at the colorized braces... sorry!
  //
  const x = 0;
  [x, [x, [x, [x, [x, [x, x], x], x], x], x], x];
  [x, [x, [x, [x, [x, [x]]]]]];
  //
  ////////////////////////////////////////////////////////////////////////////
  return {
    "editorBracketHighlight.foreground1": ui.bracket1,
    "editorBracketHighlight.foreground2": ui.bracket2,
    "editorBracketHighlight.foreground3": ui.bracket3,
    "editorBracketHighlight.foreground4": ui.bracket1,
    "editorBracketHighlight.foreground5": ui.bracket2,
    "editorBracketHighlight.foreground6": ui.bracket3,
    "editorBracketHighlight.unexpectedBracket.foreground": ui.error,
  };
}

function themePeekView(): ThemeUIColors {
  return {
    "peekView.border": ui.border1,
    "peekViewTitle.background": ui.bg0,
    "peekViewTitleLabel.foreground": ui.fg,
    "peekViewTitleDescription.foreground": syntax.alt1,
    "peekViewEditor.background": ui.bg0,
    "peekViewResult.background": ui.bg0,
    "peekViewResult.fileForeground": ui.fg,
    "peekViewResult.lineForeground": ui.fg,
  };
}

function themeEditor(): ThemeUIColors {
  return {
    "editorWidget.foreground": ui.fg,
    "editorWidget.background": ui.bg0,
    "editorWidget.border": ui.border1,
    "editorWidget.resizeBorder": ui.border1,
    "editorBracketMatch.background": alpha(syntax.due2, 15),
    "editorBracketMatch.border": alpha(syntax.due2, 50),
    "editor.findMatchBackground": alpha(bg.orange, 50),
    "editor.findMatchHighlightBackground": alpha(bg.orange, 50),
    "editor.findRangeHighlightBackground": alpha(bg.yellow, 50),
    "editor.foreground": ui.fg,
    "editor.background": ui.bg0,
    "editor.foldBackground": transparent,
    "editorLink.activeForeground": terminal.blue,
    "editor.lineHighlightBackground": ui.bg1,
    "editor.rangeHighlightBackground": alpha(bg.yellow, 50),
    "editor.selectionBackground": alpha(syntax.due2, 30),
    "editor.inactiveSelectionBackground": alpha(syntax.due2, 30),
    "editor.wordHighlightBackground": alpha(bg.blue, 50),
    "editor.wordHighlightStrongBackground": alpha(bg.purple, 50),
    "editorOverviewRuler.border": alpha(ui.border0, 25),
    "editorCursor.foreground": ui.accent0,
    "editorGroup.border": ui.border0,
    "editorIndentGuide.background": alpha(ui.fg, 10),
    "editorIndentGuide.activeBackground": alpha(ui.fg, 50),
    "editorLineNumber.foreground": ui.border1,
    "editorLineNumber.activeForeground": ui.fg,

    "editorCodeLens.foreground": syntax.alt0,
    "editorLightBulb.foreground": syntax.uno1,
    "editorLightBulbAutoFix.foreground": syntax.due1,

    "editorRuler.foreground": alpha(ui.border0, 50),

    "editorSuggestWidget.background": ui.bg0,
    "editorHoverWidget.background": ui.bg0,
    "editorSuggestWidget.border": ui.border1,
    "editorHoverWidget.border": ui.border1,

    "editorGutter.background": undefined,
    "editorGutter.modifiedBackground": terminal.magenta,
    "editorGutter.addedBackground": terminal.blue,
    "editorGutter.deletedBackground": terminal.red,
    "editorGutter.commentRangeForeground": undefined,
    "editorGutter.commentGlyphForeground": undefined,
    "editorGutter.commentUnresolvedGlyphForeground": undefined,
    "editorGutter.foldingControlForeground": undefined,
  };
}

function themeTitlebar(): ThemeUIColors {
  return {
    "titleBar.activeBackground": ui.bg1,
    "titleBar.activeForeground": ui.fg,
    "titleBar.inactiveBackground": ui.bg1,
    "titleBar.inactiveForeground": alpha(ui.fg, 70),
    "titleBar.border": ui.border0,
  };
}

function themeTabs(): ThemeUIColors {
  return {
    "tab.border": ui.border0,
    "editorGroupHeader.tabsBorder": ui.border0,
    "editorGroupHeader.border": ui.border0,
    "breadcrumb.background": ui.bg0,
    "editorGroupHeader.noTabsBackground": ui.bg0,
    "editorGroupHeader.tabsBackground": ui.bg1,
    "tab.activeBorder": ui.border0,
    "tab.unfocusedActiveBorder": ui.border0,
    "tab.activeBorderTop": ui.accent0,
    "tab.unfocusedActiveBorderTop": ui.accent0,
    "tab.activeBackground": ui.bg0,
    "tab.activeForeground": ui.fg,
    "tab.inactiveBackground": ui.bg1,
    "tab.inactiveForeground": alpha(ui.fg, 80),
  };
}

function colors(): ThemeUIColors {
  return {
    focusBorder: ui.accent0,
    errorForeground: terminal.red,
    disabledForeground: alpha(ui.fg, 50),
    "icon.foreground": ui.fg,
    "toolbar.hoverBackground": alpha(ui.border1, 30),
    "toolbar.activeBackground": alpha(ui.border1, 50),
    "widget.border": ui.border0,
    "widget.shadow": ui.bg0,
    ...themeScrollbar(),
    "input.border": ui.border1,
    "input.background": ui.bg0,
    "input.placeholderForeground": alpha(ui.fg, 40),
    "progressBar.background": ui.fg,
    "inputOption.activeBorder": ui.fg,
    ...themeCommandCenter(),
    ...themeList(),
    ...themeStatusBar(),
    ...themeBadge(),
    ...themeMenu(),
    ...themeKeybinding(),
    ...themeActivityBar(),
    ...themeBracketColors(),
    ...themeEditor(),
    ...themePeekView(),
    ...themeNotifications(),
    ...themeDragAndDrop(),
    ...themeButton(),
    foreground: ui.fg,
    "panel.background": ui.bg0,
    "panel.border": ui.border0,
    "panelTitle.activeBorder": ui.accent0,
    "panelTitle.activeForeground": ui.accent0,
    "panelTitle.inactiveForeground": ui.fg,
    "sideBar.border": ui.border0,
    "sideBar.background": ui.bg1,
    "sideBarSectionHeader.background": ui.bg1,
    "sideBarSectionHeader.border": ui.border0,
    "tree.indentGuidesStroke": alpha(ui.fg, 10),
    ...themeTabs(),
    "pickerGroup.border": alpha(ui.border0, 50),
    ...themeDiff(),
    ...themeMerge(),
    ...themeGit(),
    ...themeTitlebar(),
    "debugToolBar.background": ui.bg0,
    ...themeDropdown(),
    ...themeHighlightBorders(),
    ...themeTerminal(),
    ...themeWelcome(),
    ...themeSettings(),
  };
}

function themeCommandCenter(): ThemeUIColors {
  return {
    "commandCenter.foreground": ui.fg,
    "commandCenter.inactiveForeground": alpha(ui.fg, 50),
    "commandCenter.background": ui.bg1,
    "commandCenter.border": ui.border0,
    "commandCenter.inactiveBorder": ui.border0,
    "commandCenter.activeBackground": alpha(ui.border1, 10),
    "commandCenter.activeBorder": ui.border0,
  };
}

function tokenColors(): TokenColor[] {
  function createToken(foreground: string): TokenSettingColor {
    return { foreground };
  }

  const tokens = {
    default: createToken(syntax.default),

    alt0: createToken(syntax.alt0),
    alt1: createToken(syntax.alt1),

    uno0: createToken(syntax.uno0),
    uno1: createToken(syntax.uno1),

    due0: createToken(syntax.due0),
    due1: createToken(syntax.due1),
    due2: createToken(syntax.due2),

    tre0: createToken(syntax.tre0),
    tre1: createToken(syntax.tre1),
    tre2: createToken(syntax.tre2),
  } as const;

  return [
    {
      scope: [
        "meta.embedded",
        "source.groovy.embedded",
        "string meta.image.inline.markdown",
      ],
      settings: tokens.default,
    },
    {
      scope: "emphasis",
      settings: {
        fontStyle: "italic",
      },
    },
    {
      scope: "strong",
      settings: {
        fontStyle: "bold",
      },
    },
    {
      scope: "header",
      settings: tokens.uno1,
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: tokens.alt0,
    },
    {
      scope: "constant.language",
      settings: tokens.tre2,
    },
    // {
    //   scope: [
    //     "variable.other.enummember",
    //     "keyword.operator.plus.exponent",
    //     "keyword.operator.minus.exponent",
    //   ],
    //   settings: tokens.default,
    // },
    {
      scope: "constant.regexp",
      settings: tokens.tre1,
    },
    {
      name: "JSX tags",
      scope: ["support.class.component", "entity.name.tag"],
      settings: tokens.uno0,
    },
    {
      scope: "entity.name.tag.css",
      settings: tokens.default,
    },
    {
      scope: "entity.other.attribute-name",
      settings: tokens.due1,
    },
    {
      scope: [
        "entity.other.attribute-name.class.css",
        "entity.other.attribute-name.class.mixin.css",
        "entity.other.attribute-name.id.css",
        "entity.other.attribute-name.parent-selector.css",
        "source.css.less entity.other.attribute-name.id",
        "entity.other.attribute-name.scss",
      ],
      settings: tokens.due1,
    },
    {
      scope: [
        "entity.other.attribute-name.pseudo-class.css",
        "entity.other.attribute-name.pseudo-element.css",
      ],
      settings: tokens.due2,
    },
    {
      scope: "invalid",
      settings: {
        foreground: ui.error,
      },
    },
    {
      scope: "markup.underline",
      settings: {
        fontStyle: "underline",
      },
    },
    {
      scope: "markup.bold",
      settings: {
        fontStyle: "bold",
        foreground: syntax.due1,
      },
    },
    {
      scope: "markup.heading",
      settings: {
        fontStyle: "bold",
        foreground: syntax.uno1,
      },
    },
    {
      scope: "markup.italic",
      settings: {
        fontStyle: "italic",
        foreground: syntax.due1,
      },
    },
    {
      scope: "markup.strikethrough",
      settings: {
        fontStyle: "strikethrough",
      },
    },
    {
      scope: "markup.inserted",
      settings: {
        foreground: terminal.blue,
      },
    },
    {
      scope: "markup.deleted",
      settings: {
        foreground: terminal.red,
      },
    },
    {
      scope: "markup.changed",
      settings: {
        foreground: terminal.yellow,
      },
    },
    {
      scope: "punctuation.definition.quote.begin.markdown",
      settings: tokens.alt1,
    },
    {
      scope: "punctuation.definition.list.begin.markdown",
      settings: tokens.alt1,
    },
    {
      scope: "markup.inline.raw",
      settings: tokens.due1,
    },
    {
      name: "brackets of XML/HTML tags",
      scope: "punctuation.definition.tag",
      settings: tokens.alt1,
    },
    {
      scope: ["meta.preprocessor", "entity.name.function.preprocessor"],
      settings: tokens.due1,
    },
    {
      scope: "meta.preprocessor.string",
      settings: tokens.tre1,
    },
    {
      scope: ["constant.numeric", "meta.preprocessor.numeric"],
      settings: tokens.tre0,
    },
    {
      scope: "meta.structure.dictionary.key.python",
      settings: tokens.uno1,
    },
    {
      scope: "source.diff",
      settings: tokens.alt1,
    },
    {
      scope: "meta.diff.header",
      settings: {
        foreground: terminal.white,
      },
    },
    {
      scope: "storage",
      settings: tokens.default,
    },
    {
      scope: ["source.java storage.type", "source.go storage.type"],
      settings: tokens.due1,
    },
    {
      scope: "storage.type",
      settings: tokens.uno1,
    },
    {
      scope: ["storage.modifier", "keyword.operator.noexcept"],
      settings: tokens.uno1,
    },
    {
      scope: ["string", "meta.embedded.assembly", "constant.other.symbol"],
      settings: tokens.tre1,
    },
    {
      scope: "string.tag",
      settings: tokens.tre1,
    },
    {
      scope: "string.value",
      settings: tokens.tre1,
    },
    {
      scope: "string.regexp",
      settings: tokens.tre1,
    },
    {
      name: "String interpolation",
      scope: [
        "punctuation.definition.template-expression.begin",
        "punctuation.definition.template-expression.end",
        "punctuation.section.embedded",
      ],
      settings: tokens.alt1,
    },
    {
      name: "Reset string interpolation expression",
      scope: ["meta.template.expression", "meta.interpolation"],
      settings: tokens.default,
    },
    {
      scope: [
        "support.type.vendored.property-name",
        "support.type.property-name",
        "variable.css",
        "variable.scss",
        "variable.other.less",
        "source.coffee.embedded",
      ],
      settings: tokens.uno0,
    },
    {
      scope: "keyword",
      settings: tokens.uno1,
    },
    {
      scope: "keyword.control",
      settings: tokens.uno1,
    },
    {
      scope: ["keyword.operator.type.annotation"],
      settings: tokens.alt1,
    },
    {
      scope: "keyword.operator",
      settings: tokens.uno1,
    },
    {
      scope: [
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.operator.cast",
        "keyword.operator.sizeof",
        "keyword.operator.alignof",
        "keyword.operator.typeid",
        "keyword.operator.alignas",
        "keyword.operator.instanceof",
        "keyword.operator.logical.python",
        "keyword.operator.wordlike",
      ],
      settings: tokens.uno1,
    },
    {
      scope: "keyword.other.unit",
      settings: tokens.tre2,
    },
    {
      scope: [
        "punctuation.section.embedded.begin.php",
        "punctuation.section.embedded.end.php",
      ],
      settings: tokens.alt1,
    },
    // {
    //   scope: "support.function.git-rebase",
    //   settings: {
    //     foreground: "#9cdcfe",
    //   },
    // },
    // {
    //   scope: "constant.sha.git-rebase",
    //   settings: {
    //     foreground: "#b5cea8",
    //   },
    // },
    {
      name: "coloring of the Java import and package identifiers",
      scope: [
        "storage.modifier.import.java",
        "variable.language.wildcard.java",
        "storage.modifier.package.java",
      ],
      settings: tokens.default,
    },
    {
      name: "self",
      scope: "variable.language",
      settings: tokens.due2,
    },
    {
      name: "Functions",
      scope: [
        "entity.name.function",
        "meta.function-call.generic",
        "support.function",
        "support.constant.handlebars",
        "source.powershell variable.other.member",
        // See https://en.cppreference.com/w/cpp/language/user_literal
        "entity.name.operator.custom-literal",
      ],
      settings: tokens.due0,
    },
    {
      name: "Types declaration and references",
      scope: [
        "support.class",
        "support.type",
        "entity.name.type",
        "entity.name.namespace",
        "entity.other.attribute",
        "entity.name.scope-resolution",
        "entity.name.class",
        // "storage.type.numeric.go",
        // "storage.type.byte.go",
        // "storage.type.boolean.go",
        // "storage.type.string.go",
        // "storage.type.uintptr.go",
        // "storage.type.error.go",
        // "storage.type.rune.go",
        // "storage.type.cs",
        // "storage.type.generic.cs",
        // "storage.type.modifier.cs",
        // "storage.type.variable.cs",
        // "storage.type.annotation.java",
        // "storage.type.generic.java",
        // "storage.type.java",
        // "storage.type.object.array.java",
        // "storage.type.primitive.array.java",
        // "storage.type.primitive.java",
        // "storage.type.token.java",
        // "storage.type.groovy",
        // "storage.type.annotation.groovy",
        // "storage.type.parameters.groovy",
        // "storage.type.generic.groovy",
        // "storage.type.object.array.groovy",
        // "storage.type.primitive.array.groovy",
        // "storage.type.primitive.groovy",
      ],
      settings: tokens.due1,
    },
    {
      name: "Types declaration and references, TS grammar specific",
      scope: [
        "meta.type.cast.expr",
        "meta.type.new.expr",
        "support.constant.math",
        "support.constant.dom",
        "support.constant.json",
        "entity.other.inherited-class",
      ],
      settings: tokens.due1,
    },
    {
      name: "Control flow / Special keywords",
      scope: [
        "keyword.control",
        "source.cpp keyword.operator.new",
        "keyword.operator.delete",
        "keyword.other.using",
        "keyword.other.operator",
        "entity.name.operator",
      ],
      settings: tokens.uno1,
    },
    {
      name: "Variable and parameter name",
      scope: [
        "variable",
        "meta.definition.variable.name",
        "support.variable",
        "entity.name.variable",
      ],
      settings: tokens.default,
    },
    // {
    //   name: "Constants and enums",
    //   scope: [
    //     "variable.other.constant",
    //     "variable.other.enummember",
    //   ],
    //   settings: tokens.default,
    // },
    {
      name: "Object keys, TS grammar specific",
      scope: ["meta.object-literal.key"],
      settings: tokens.uno0,
    },
    {
      name: "CSS property value",
      scope: [
        "support.constant.property-value",
        "support.constant.font-name",
        "support.constant.media-type",
        "support.constant.media",
        "constant.other.color.rgb-value",
        "constant.other.rgb-value",
        "support.constant.color",
      ],
      settings: tokens.due0,
    },
    {
      name: "String placeholders",
      scope: [
        // placeholders in strings
        "constant.other.placeholder",
      ],
      settings: tokens.uno1,
    },
    {
      name: "Regular expression groups",
      scope: [
        "punctuation.definition.group.regexp",
        "punctuation.definition.group.assertion.regexp",
        "punctuation.definition.character-class.regexp",
        "punctuation.character.set.begin.regexp",
        "punctuation.character.set.end.regexp",
        "keyword.operator.negation.regexp",
        "support.other.parenthesis.regexp",
      ],
      settings: tokens.tre0,
    },
    {
      scope: [
        "constant.character.character-class.regexp",
        "constant.other.character-class.set.regexp",
        "constant.other.character-class.regexp",
        "constant.character.set.regexp",
      ],
      settings: tokens.tre0,
    },
    {
      scope: ["keyword.operator.or.regexp", "keyword.control.anchor.regexp"],
      settings: tokens.alt1,
    },
    {
      scope: "keyword.operator.quantifier.regexp",
      settings: tokens.tre0,
    },
    {
      scope: ["constant.character", "constant.other.option"],
      settings: tokens.tre0,
    },
    {
      scope: "constant.character.escape",
      settings: tokens.tre0,
    },
    {
      scope: "entity.name.label",
      settings: tokens.default,
    },
    {
      scope: ["punctuation", "meta.brace"],
      settings: tokens.alt1,
    },
  ];
}

const contrastErrors: string[] = [];

function showContrast(
  level: ContrastLevel,
  fg: string,
  bg: string,
  fgStr: string,
  bgStr: string
): void {
  const contrast = colord(fg).contrast(bg);
  const fail = contrast < Contrast[level];
  const str = [
    fail ? "[!]" : "   ",
    ANSI.bold.yellow(contrast.toFixed(2).toString().padStart(5)),
    ANSI.bold.magenta("::"),
    bgStr,
    ANSI.bold.magenta("<-"),
    fgStr,
  ].join(" ");
  if (fail) {
    const msg = ANSI.bold.red(str);
    console.error(msg);
    contrastErrors.push(msg);
  } else {
    console.log(str);
  }
}

function save(): void {
  printContrastReport();
  const json = JSON.stringify(config(), null, 2);
  fs.writeFileSync("themes/miasma-color-theme.json", json);
}

function printContrastReport(): void {
  showContrast("text", ui.error, ui.bg0, "ui.error", "ui.bg0");
  showContrast("text", ui.fg, ui.bg0, "ui.fg", "ui.bg0");
  showContrast("text", ui.fg, ui.bg1, "ui.fg", "ui.bg1");
  showContrast("text", ui.link, ui.bg0, "ui.accent0", "ui.bg0");
  showContrast("text", ui.accent0, ui.bg0, "ui.accent1", "ui.bg0");
  showContrast("text", ui.accent1, ui.bg0, "ui.accent2", "ui.bg0");
  showContrast("decoration", ui.border0, ui.bg0, "ui.border0", "ui.bg0");
  showContrast("decoration", ui.border0, ui.bg1, "ui.border0", "ui.bg1");
  showContrast(
    "decoration",
    syntax.uno0,
    syntax.uno1,
    "syntax.uno0",
    "syntax.uno1"
  );
  showContrast(
    "decoration",
    syntax.tre0,
    syntax.tre1,
    "syntax.due0",
    "syntax.due1"
  );
  showContrast(
    "decoration",
    syntax.due1,
    syntax.due2,
    "syntax.due1",
    "syntax.due2"
  );
  showContrast(
    "decoration",
    syntax.tre0,
    syntax.tre1,
    "syntax.tre0",
    "syntax.tre1"
  );
  showContrast(
    "decoration",
    syntax.tre1,
    syntax.tre2,
    "syntax.tre1",
    "syntax.tre2"
  );
  showContrast("ui", ui.border1, ui.bg0, "ui.border1", "ui.bg0");
  showContrast("ui", ui.border1, ui.bg1, "ui.border1", "ui.bg1");
  showContrast(
    "decoration",
    syntax.uno0,
    syntax.uno1,
    "syntax.uno0",
    "syntax.uno1"
  );
  showContrast(
    "decoration",
    syntax.due0,
    syntax.due1,
    "syntax.due0",
    "syntax.due1"
  );
  showContrast(
    "decoration",
    syntax.due1,
    syntax.due2,
    "syntax.due1",
    "syntax.due2"
  );
  showContrast(
    "decoration",
    syntax.tre0,
    syntax.tre1,
    "syntax.tre0",
    "syntax.tre1"
  );
  showContrast(
    "decoration",
    syntax.tre1,
    syntax.tre2,
    "syntax.tre1",
    "syntax.tre2"
  );
  for (const [name, color] of Object.entries(syntax)) {
    showContrast("text", color, ui.bg0, `syntax.${name}`, "ui.bg0");
  }
  for (const [name, color] of Object.entries(terminal)) {
    if (name === "black") {
      continue;
    }
    showContrast("text", color, ui.bg0, `terminal.${name}`, "ui.bg0");
  }
  showContrast("text", ui.bracket1, ui.bg0, "ui.bracket1", "ui.bg0");
  showContrast("text", ui.bracket2, ui.bg0, "ui.bracket2", "ui.bg0");
  showContrast("text", ui.bracket3, ui.bg0, "ui.bracket3", "ui.bg0");
  if (contrastErrors.length > 0) {
    console.error(ANSI.bold.red("\n>>> CONTRAST FAILURE\n"));
    for (const error of contrastErrors) {
      console.error(error);
    }
    process.exit(1);
  }
}

save();
