import * as React from 'react';

import {classNames} from '@shopify/react-utilities/styles';
import {autobind, memoize} from '@shopify/javascript-utilities/decorators';
import Nav from '../../Nav';

import {navBarCollapsed} from '../../../../utilities/breakpoints';
import {Icon, IconProps, UnstyledLink} from '../../../../components';

import {Context, contextTypes} from '../../types';

import * as styles from './Item.scss';

interface ItemURLDetails {
  url?: string;
  matches?: boolean;
  exactMatch?: boolean;
  matchPaths?: string[];
  excludePaths?: string[];
}

export interface SubNavItem extends ItemURLDetails {
  url: string;
  label: string;
  disabled?: boolean;
  onClick?(event: React.MouseEvent<HTMLElement>): void;
}

interface SecondaryAction {
  url: string;
  accessibilityLabel: string;
  icon: IconProps['source'];
}

export interface Props extends ItemURLDetails {
  icon?: IconProps['source'];
  iconBody?: string;
  badge?: string | null;
  label: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  selected?: boolean;
  exactMatch?: boolean;
  subNavItems?: SubNavItem[];
  secondaryAction?: SecondaryAction;
  onClick?(): void;
}

interface State {
  expanded: boolean;
}

enum MatchState {
  MatchForced,
  MatchUrl,
  MatchPaths,
  Excluded,
  NoMatch,
}

export default class Item extends React.Component<Props, State> {
  static contextTypes = contextTypes;

  context!: Context;

  state: State = {
    expanded: false,
  };

  componentDidMount() {
    navBarCollapsed().addListener(this.handleResize);
  }

  componentWillUnmount() {
    navBarCollapsed().removeListener(this.handleResize);
  }

  render(): React.ReactElement<Props> {
    const {expanded} = this.state;

    const {
      url,
      icon,
      label,
      badge,
      subNavItems = [],
      secondaryAction,
      disabled,
      onClick,
      accessibilityLabel,
      iconBody,
      selected: selectedOverride,
    } = this.props;

    const {location, onNavDismiss} = this.context;

    const badgeMarkup = badge && <span className={styles.Badge}>{badge}</span>;

    const iconMarkup = iconBody ? (
      <span
        className={styles.Icon}
        dangerouslySetInnerHTML={{__html: iconBody}}
      />
    ) : (
      icon && (
        <div className={styles.Icon}>
          <Icon source={icon} />
        </div>
      )
    );

    if (url == null) {
      const className = classNames(styles.Item, disabled && styles.disabled);

      return (
        <li className={styles.ListItem}>
          <button
            type="button"
            className={className}
            aria-disabled={disabled}
            aria-label={accessibilityLabel}
            onClick={this.getClickHandler(onClick)}
          >
            {iconMarkup}
            <span className={styles.Text}>{label}</span>
            {badgeMarkup}
          </button>
        </li>
      );
    }

    const secondaryActionMarkup = secondaryAction && (
      <UnstyledLink
        external
        url={secondaryAction.url}
        className={styles.SecondaryAction}
        aria-label={secondaryAction.accessibilityLabel}
      >
        <Icon source={secondaryAction.icon} />
      </UnstyledLink>
    );

    const matchState = matchStateForItem(this.props, location);

    const matchingSubNavItems = subNavItems.filter((item) => {
      const subMatchState = matchStateForItem(item, location);
      return (
        subMatchState === MatchState.MatchForced ||
        subMatchState === MatchState.MatchUrl ||
        subMatchState === MatchState.MatchPaths
      );
    });

    const childIsActive = matchingSubNavItems.length > 0;

    const selected =
      selectedOverride == null
        ? matchState === MatchState.MatchForced ||
          matchState === MatchState.MatchUrl ||
          matchState === MatchState.MatchPaths
        : selectedOverride;

    const showExpanded = selected || expanded || childIsActive;

    const itemClassName = classNames(
      styles.Item,
      disabled && styles.disabled,
      selected && subNavItems.length === 0 && styles.selected,
      showExpanded && styles.subNavActive,
    );

    let secondaryNavMarkup: React.ReactNode = null;

    if (subNavItems.length > 0 && showExpanded) {
      const longestMatch = matchingSubNavItems.sort(
        ({url: firstUrl}, {url: secondUrl}) =>
          secondUrl.length - firstUrl.length,
      )[0];

      secondaryNavMarkup = (
        <div className={styles.SecondaryNav}>
          <Nav.Secondary expanded={showExpanded}>
            {subNavItems.map((item) => {
              const {label, ...rest} = item;
              return (
                <Item
                  {...rest}
                  key={label}
                  label={label}
                  matches={item === longestMatch}
                  onClick={onNavDismiss}
                />
              );
            })}
          </Nav.Secondary>
        </div>
      );
    }

    const className = classNames(
      styles.ListItem,
      secondaryAction && styles['ListItem-hasAction'],
    );

    return (
      <li className={className}>
        <UnstyledLink
          url={url}
          className={itemClassName}
          aria-disabled={disabled}
          aria-label={accessibilityLabel}
          onClick={this.getClickHandler(onClick)}
        >
          {iconMarkup}
          <span className={styles.Text}>{label}</span>
          {badgeMarkup}
        </UnstyledLink>
        {secondaryActionMarkup}
        {secondaryNavMarkup}
      </li>
    );
  }

  @autobind
  private handleResize() {
    if (!navBarCollapsed().matches) {
      this.setState({expanded: false});
    }
  }

  @autobind
  @memoize()
  private getClickHandler(onClick: Props['onClick']) {
    return (event: React.MouseEvent<HTMLElement>) => {
      const {currentTarget} = event;
      const {subNavItems} = this.props;
      const {location, onNavDismiss} = this.context;

      if (currentTarget.getAttribute('href') === location) {
        event.preventDefault();
      }

      if (subNavItems && subNavItems.length > 0 && navBarCollapsed().matches) {
        event.preventDefault();
        this.setState(({expanded}) => ({expanded: !expanded}));
      } else if (onNavDismiss) {
        onNavDismiss();
        if (onClick && onClick !== onNavDismiss) {
          onClick();
        }
        return;
      }

      if (onClick && !navBarCollapsed().matches) {
        onClick();
      }
    };
  }
}

export function isNavItemActive(navItem: Props, currentPath: string) {
  const matchState = matchStateForItem(navItem, currentPath);

  const matchingSubNavItems =
    navItem.subNavItems &&
    navItem.subNavItems.filter((item) => {
      const subMatchState = matchStateForItem(item, currentPath);
      return (
        subMatchState === MatchState.MatchForced ||
        subMatchState === MatchState.MatchUrl ||
        subMatchState === MatchState.MatchPaths
      );
    });

  const childIsActive = matchingSubNavItems && matchingSubNavItems.length > 0;

  const selected =
    matchState === MatchState.MatchForced ||
    matchState === MatchState.MatchUrl ||
    matchState === MatchState.MatchPaths;

  return selected || childIsActive;
}

function normalizePathname(pathname: string) {
  const barePathname = pathname.split('?')[0].split('#')[0];
  return barePathname.endsWith('/') ? barePathname : `${barePathname}/`;
}

function safeEqual(location: string, path: string) {
  return normalizePathname(location) === normalizePathname(path);
}

function safeStartsWith(location: string, path: string) {
  return normalizePathname(location).startsWith(normalizePathname(path));
}

function matchStateForItem(
  {url, matches, exactMatch, matchPaths, excludePaths}: ItemURLDetails,
  location: string,
) {
  if (url == null) {
    return MatchState.NoMatch;
  }

  if (matches) {
    return MatchState.MatchForced;
  }

  if (
    matches === false ||
    (excludePaths &&
      excludePaths.some((path) => safeStartsWith(location, path)))
  ) {
    return MatchState.Excluded;
  }

  if (matchPaths && matchPaths.some((path) => safeStartsWith(location, path))) {
    return MatchState.MatchPaths;
  }

  const matchesUrl = exactMatch
    ? safeEqual(location, url)
    : safeStartsWith(location, url);
  return matchesUrl ? MatchState.MatchUrl : MatchState.NoMatch;
}
