const {
  getCustomPropertyNames,
  createVar,
  tokens,
} = require('@shopify/polaris-tokens');

const disallowedUnits = [
  'px',
  'rem',
  'em',
  '%',
  'ex',
  'ch',
  'lh',
  'rlh',
  'vw',
  'vh',
  'vmin',
  'vmax',
  'vb',
  'vi',
  'svw',
  'svh',
  'lvw',
  'lvh',
  'dvw',
  'dvh',
  'cm',
  'mm',
  'Q',
  'in',
  'pc',
  'pt',
];

/**
 * @type {import('./plugins/coverage').PrimaryOptions} The stylelint-polaris/coverage rule expects a 3-dimensional rule config that groups Stylelint rules by coverage categories. It reports problems with dynamic rule names by appending the category to the coverage plugin's rule name

(e.g., Unexpected named color "blue" - Please use a Polaris color token Stylelint(polaris/colors/color-named)")
*/
const stylelintPolarisCoverageOptions = {
  border: [
    {
      'declaration-property-unit-disallowed-list': [
        {
          'border-width': disallowedUnits,
          border: disallowedUnits,
          'border-radius': disallowedUnits,
          'outline-offset': disallowedUnits,
          outline: disallowedUnits,
        },
      ],
      'polaris/at-rule-disallowed-list': {
        include: [
          'high-contrast-border',
          'high-contrast-button-outline',
          'high-contrast-outline',
          'focus-ring',
          'no-focus-ring',
        ].map(matchNameRegExp),
      },
    },
    {
      message: 'Please use a Polaris border token',
    },
  ],
  color: [
    {
      'color-named': 'never',
      'color-no-hex': true,
      'scss/function-color-relative': true,
      'function-disallowed-list': [
        // Include Sass namespace
        // https://regex101.com/r/UdW0oV/1
        'brightness',
        'contrast',
        'hue-rotate',
        'hsl',
        'hsla',
        'invert',
        'rgb',
        'rgba',
        'sepia',
        ...['color-multiply', 'color', 'filter'].map(matchNameRegExp),
      ],
      'polaris/at-rule-disallowed-list': {
        include: [
          // Legacy mixins
          'recolor-icon',
          'ms-high-contrast-color',
        ].map(matchNameRegExp),
      },
      'polaris/global-disallowed-list': [
        // Legacy mixin map-get data
        /\$polaris-colors/,
        /\$color-filter-palette-data/,
        /\$color-palette-data/,
      ],
    },
    {
      message: 'Please use a Polaris color token',
    },
  ],
  conventions: {
    'selector-disallowed-list': [
      [/class[*^~]?='Polaris-[a-z_-]+'/gi],
      {
        message:
          'Overriding Polaris styles is disallowed. Please consider contributing instead',
      },
    ],
    'polaris/custom-property-allowed-list': {
      // Allows definition of custom properties not prefixed with `--p-`, `--pc-`, or `--polaris-version-`
      allowedProperties: [/--(?!(p|pc|polaris-version)-).+/],
      // Allows use of custom properties prefixed with `--p-` that are valid Polaris tokens
      allowedValues: {
        '/.+/': [
          // Note: Order is important
          // This pattern allows use of `--p-*` custom properties that are valid Polaris tokens
          ...getCustomPropertyNames(tokens),
          // This pattern flags unknown `--p-*` custom properties or usage of deprecated `--pc-*` custom properties private to polaris-react
          /--(?!(p|pc)-).+/,
        ],
      },
    },
  },
  layout: [
    {
      'declaration-property-value-disallowed-list': [
        {
          top: [/(?!var\(--p-).+$/],
          bottom: [/(?!var\(--p-).+$/],
          left: [/(?!var\(--p-).+$/],
          right: [/(?!var\(--p-).+$/],
          '/^width/': [/(?!var\(--p-).+$/],
          '/^height/': [/(?!var\(--p-).+$/],
        },
        {severity: 'warning'},
      ],
      'property-disallowed-list': [
        [
          'position',
          'grid',
          'flex',
          'flex-grow',
          'flex-shrink',
          'flex-basis',
          'justify-content',
          'align-items',
          'grid-row',
          'grid-row-start',
          'grid-row-end',
          'grid-column',
          'grid-column-start',
          'grid-column-end',
          'grid-template',
          'grid-template-areas',
          'grid-template-rows',
          'grid-template-columns',
          'grid-area',
          'display',
        ],
        {severity: 'warning'},
      ],
      'function-disallowed-list': [
        'nav-min-window-corrected',
        'control-height',
        'control-slim-height',
        'mobile-nav-width',
        'thumbnail-size',
        'top-bar-height',
      ].map(matchNameRegExp),
      'polaris/at-rule-disallowed-list': {
        include: ['layout-flex-fix', 'safe-area-for'].map(matchNameRegExp),
      },
      'polaris/global-disallowed-list': [
        // Legacy mixin map-get data
        /\$layout-width-data/,
        /\$navigation-width/,
        /\$small-thumbnail-size/,
        /\$large-thumbnail-size/,
        /\$medium-thumbnail-size/,
        /\$thumbnail-sizes/,
      ],
    },
    {
      message:
        'Consider using a Polaris layout component if applicable for this layout style',
    },
  ],
  legacy: [
    {
      // Legacy mixins
      'polaris/at-rule-disallowed-list': {
        include: [
          'base-button-disabled',
          'button-base',
          'button-filled',
          'button-full-width',
          'button-outline-disabled',
          'button-outline',
          'control-backdrop',
          'list-selected-indicator',
          'plain-button-backdrop',
          'unstyled-button',
          'skeleton-content',
          'unstyled-input',
          'unstyled-link',
          'unstyled-list',
          'range-thumb-selectors',
          'range-track-selectors',
          'state',
          'visually-hidden',
        ].map(matchNameRegExp),
      },
      // Legacy functions
      'function-disallowed-list': [
        'available-names',
        'map-extend',
        'em',
        'rem',
      ].map(matchNameRegExp),
      'polaris/global-disallowed-list': [
        // Legacy variables
        / \* \$/,
      ],
    },
    {
      message: 'Please use a Polaris token or component',
    },
  ],
  'media-queries': [
    {
      'polaris/media-query-allowed-list': {
        // Allowed media types and media conditions
        // https://www.w3.org/TR/mediaqueries-5/#media
        allowedMediaTypes: ['print', 'screen'],
        allowedMediaFeatureNames: [
          'forced-colors',
          '-ms-high-contrast',
          'prefers-reduced-motion',
        ],
        allowedScssInterpolations: [
          // TODO: Add utility to @shopify/polaris-tokens to getMediaConditionNames
          matchNameRegExp(
            String.raw`\$p-breakpoints-(xs|sm|md|lg|xl)-(up|down|only)`,
          ),
        ],
      },
      // Legacy functions
      'function-disallowed-list': ['breakpoint', 'layout-width'].map(
        matchNameRegExp,
      ),
      // Legacy mixins
      'polaris/at-rule-disallowed-list': {
        include: [
          'after-topbar-sheet',
          'breakpoint-after',
          'breakpoint-before',
          'frame-when-nav-displayed',
          'frame-when-nav-hidden',
          'frame-with-nav-when-not-max-width',
          'page-actions-layout',
          'page-content-breakpoint-after',
          'page-content-breakpoint-before',
          'page-content-layout',
          'page-content-when-fully-condensed',
          'page-content-when-layout-not-stacked',
          'page-content-when-layout-stacked',
          'page-content-when-not-fully-condensed',
          'page-content-when-not-partially-condensed',
          'page-content-when-partially-condensed',
          'page-header-has-navigation',
          'page-header-has-secondary-actions',
          'page-header-layout',
          'page-header-without-navigation',
          'page-layout',
          'page-padding-not-fully-condensed',
          'page-padding-not-partially-condensed',
          'page-title-layout',
          'page-when-not-max-width',
          'when-typography-condensed',
          'when-typography-not-condensed',
          'when-not-printing',
          'hidden-when-printing',
          'print-hidden',
        ].map(matchNameRegExp),
      },
    },
    {
      message: 'Please use a Polaris breakpoint token',
    },
  ],
  motion: [
    {
      'function-disallowed-list': ['control-icon-transition'].map(
        matchNameRegExp,
      ),
      'declaration-property-unit-disallowed-list': [
        {
          '/^animation/': ['ms', 's'],
          '/^transition/': ['ms', 's'],
        },
      ],
      'at-rule-disallowed-list': ['keyframes'],
      'polaris/at-rule-disallowed-list': {
        include: ['skeleton-shimmer'].map(matchNameRegExp),
      },
      'polaris/global-disallowed-list': [
        // Legacy mixin map-get data
        /\$skeleton-shimmer-duration/,
      ],
    },
    {
      message: 'Please use a Polaris motion token',
    },
  ],
  shadow: [
    {
      'function-disallowed-list': ['shadow'].map(matchNameRegExp),
      'declaration-property-unit-disallowed-list': [
        {
          'box-shadow': disallowedUnits,
        },
      ],
      'property-disallowed-list': ['text-shadow'],
      'polaris/global-disallowed-list': [
        // Legacy mixin map-get data
        /\$shadows-data/,
      ],
    },
    {
      message: 'Please use a Polaris shadow token',
    },
  ],
  space: [
    {
      'function-disallowed-list': ['control-vertical-padding'].map(
        matchNameRegExp,
      ),
      'declaration-property-unit-disallowed-list': [
        {
          '/^padding/': disallowedUnits,
          '/^margin/': disallowedUnits,
          '/^gap/': disallowedUnits,
        },
      ],
      'polaris/global-disallowed-list': [
        // Legacy mixin map-get data
        /\$polaris-spacing/,
      ],
    },
    {
      message: 'Please use a Polaris space token',
    },
  ],
  typography: [
    {
      'polaris/declaration-property-value-disallowed-list': {
        'font-weight': [/(\$.*|[0-9]+)/],
      },
      'declaration-property-unit-disallowed-list': [
        {
          '/^font/': disallowedUnits,
          'line-height': disallowedUnits,
        },
      ],
      'property-disallowed-list': ['text-transform'],
      'function-disallowed-list': ['font-size', 'line-height'].map(
        matchNameRegExp,
      ),
      'polaris/at-rule-disallowed-list': {
        include: [
          'truncate',
          'text-breakword',
          'text-emphasis-normal',
          'text-emphasis-strong',
          'text-emphasis-subdued',
          'text-style-body',
          'text-style-button-large',
          'text-style-button',
          'text-style-caption',
          'text-style-display-large',
          'text-style-display-medium',
          'text-style-display-small',
          'text-style-display-x-large',
          'text-style-heading',
          'text-style-input',
          'text-style-subheading',
        ].map(matchNameRegExp),
      },
      'polaris/global-disallowed-list': [
        // Legacy mixin map-get data
        /\$base-font-size/,
        /\$line-height-data/,
        /\$font-size-data/,
        /\$default-browser-font-size/,
      ],
    },
    {
      message: 'Please use a Polaris font token or typography component',
    },
  ],
  'z-index': [
    {
      'declaration-property-value-allowed-list': [
        {
          'z-index': Object.keys(tokens.zIndex).map(
            (token) => `var(${createVar(token)})`,
          ),
        },
      ],
      'function-disallowed-list': ['z-index'].map(matchNameRegExp),
      'polaris/global-disallowed-list': [
        // Legacy mixin map-get data
        /\$fixed-element-stacking-order/,
        /\$global-elements/,
      ],
    },
    {
      message: 'Please use a Polaris z-index token',
    },
  ],
};

/** @type {import('stylelint').Config} */
module.exports = {
  customSyntax: 'postcss-scss',
  reportDescriptionlessDisables: true,
  reportNeedlessDisables: true,
  reportInvalidScopeDisables: [
    true,
    {
      // Report invalid scope disables for all rules except coverage rules
      // Note: This doesn't affect the default Stylelint behavior/reporting
      // and is only need because we dynamically create these rule names
      except: /^polaris\/.+?\/.+$/,
    },
  ],
  plugins: [
    'stylelint-scss',
    './plugins/coverage',
    './plugins/global-disallowed-list',
    './plugins/at-rule-disallowed-list',
    './plugins/custom-property-allowed-list',
    './plugins/custom-property-disallowed-list',
    './plugins/media-query-allowed-list',
    './plugins/declaration-property-value-disallowed-list',
  ],
  rules: {
    'polaris/coverage': stylelintPolarisCoverageOptions,
  },
};

function matchNameRegExp(name) {
  // Using `^` to match the start of a string since postcss normalizes name properties
  // https://regex101.com/r/3tzvIW/1
  return new RegExp(String.raw`^([\w-]+\.)?(?<![\w-])${name}(?![\w-])`);
}
