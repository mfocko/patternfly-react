import * as React from 'react';
import styles from '@patternfly/react-styles/css/components/SearchInput/search-input';
import { css } from '@patternfly/react-styles';
import { Button, ButtonVariant } from '../Button';
import { Badge } from '../Badge';
import AngleDownIcon from '@patternfly/react-icons/dist/esm/icons/angle-down-icon';
import AngleUpIcon from '@patternfly/react-icons/dist/esm/icons/angle-up-icon';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import CaretDownIcon from '@patternfly/react-icons/dist/esm/icons/caret-down-icon';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import { ActionGroup, Form, FormGroup } from '../Form';
import { InputGroup } from '../InputGroup';
import { TextInput } from '../TextInput';
import { GenerateId, KEY_CODES } from '../../helpers';

export interface SearchAttribute {
  /** The search attribute's value to be provided in the search input's query string.
   * It should have no spaces and be unique for every attribute */
  attr: string;
  /** The search attribute's display name. It is used to label the field in the advanced search menu */
  display: React.ReactNode;
}

export interface SearchInputProps extends Omit<React.HTMLProps<HTMLDivElement>, 'onChange' | 'results' | 'ref'> {
  /** Additional classes added to the banner */
  className?: string;
  /** Value of the search input */
  value?: string;
  /** Array of attribute values */
  attributes?: string[] | SearchAttribute[];
  /* Additional elements added after the attributes in the form.
   * The new form elements can be wrapped in a FormGroup component for automatic formatting */
  formAdditionalItems?: React.ReactNode;
  /** Attribute label for strings unassociated with one of the provided listed attributes */
  hasWordsAttrLabel?: React.ReactNode;
  /** Delimiter in the query string for pairing attributes with search values.
   * Required whenever attributes are passed as props */
  advancedSearchDelimiter?: string;
  /** The number of search results returned. Either a total number of results,
   * or a string representing the current result over the total number of results. i.e. "1 / 5" */
  resultsCount?: number | string;
  /** An accessible label for the search input */
  'aria-label'?: string;
  /** placeholder text of the search input */
  placeholder?: string;
  /** A callback for when the input value changes */
  onChange?: (value: string, event: React.FormEvent<HTMLInputElement>) => void;
  /** A callback for when the search button clicked changes */
  onSearch?: (
    value: string,
    event: React.SyntheticEvent<HTMLButtonElement>,
    attrValueMap: { [key: string]: string }
  ) => void;
  /** A callback for when the user clicks the clear button */
  onClear?: (event: React.SyntheticEvent<HTMLButtonElement>) => void;
  /** Function called when user clicks to navigate to next result */
  onNextClick?: (event: React.SyntheticEvent<HTMLButtonElement>) => void;
  /** Function called when user clicks to navigate to previous result */
  onPreviousClick?: (event: React.SyntheticEvent<HTMLButtonElement>) => void;
  /** A reference object to attach to the input box */
  innerRef?: React.RefObject<any>;
  /** Label for the buttons which reset the advanced search form and clear the search input */
  resetButtonLabel?: string;
  /** Label for the buttons which called the onSearch event handler */
  submitSearchButtonLabel?: string;
  /** Label for the button which opens the advanced search form menu */
  openMenuButtonAriaLabel?: string;
  /** Flag indicating if search input is disabled */
  isDisabled?: boolean;
}

const SearchInputBase: React.FunctionComponent<SearchInputProps> = ({
  className,
  value = '',
  attributes = [] as string[],
  formAdditionalItems,
  hasWordsAttrLabel = 'Has words',
  advancedSearchDelimiter,
  placeholder,
  onChange,
  onSearch,
  onClear,
  resultsCount,
  onNextClick,
  onPreviousClick,
  innerRef,
  'aria-label': ariaLabel = 'Search input',
  resetButtonLabel = 'Reset',
  openMenuButtonAriaLabel = 'Open advanced search',
  submitSearchButtonLabel = 'Search',
  isDisabled = false,
  ...props
}: SearchInputProps) => {
  const [showSearchMenu, setShowSearchMenu] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState(value);
  const isInitialMount = React.useRef(true);
  const firstAttrRef = React.useRef(null);
  const searchInputRef = React.useRef(null);
  const searchInputInputRef = innerRef || React.useRef(null);

  React.useEffect(() => {
    setSearchValue(value);
  }, [value]);

  React.useEffect(() => {
    if (attributes.length > 0 && !advancedSearchDelimiter) {
      // eslint-disable-next-line no-console
      console.error(
        'An advancedSearchDelimiter prop is required when advanced search attributes are provided using the attributes prop'
      );
    }
  });

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (showSearchMenu && firstAttrRef && firstAttrRef.current) {
        firstAttrRef.current.focus();
      } else if (!showSearchMenu && searchInputRef && searchInputRef.current) {
        searchInputInputRef.current.focus();
      }
    }
  }, [showSearchMenu]);

  React.useEffect(() => {
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    document.addEventListener('keydown', onEscPress);

    return function cleanup() {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onEscPress);
    };
  });

  const onDocClick = (event: Event) => {
    const clickedWithinSearchInput =
      searchInputRef && searchInputRef.current && searchInputRef.current.contains(event.target as Node);
    if (showSearchMenu && !clickedWithinSearchInput) {
      setShowSearchMenu(false);
    }
  };

  const onEscPress = (event: KeyboardEvent) => {
    const keyCode = event.keyCode || event.which;
    if (
      showSearchMenu &&
      keyCode === KEY_CODES.ESCAPE_KEY &&
      searchInputRef &&
      searchInputRef.current &&
      searchInputRef.current.contains(event.target as Node)
    ) {
      setShowSearchMenu(false);
      if (searchInputInputRef && searchInputInputRef.current) {
        searchInputInputRef.current.focus();
      }
    }
  };

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.currentTarget.value, event);
    }
    setSearchValue(event.currentTarget.value);
  };

  const onToggle = () => {
    setShowSearchMenu(!showSearchMenu);
  };

  const onSearchHandler = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(value, event, getAttrValueMap());
    }
    setShowSearchMenu(false);
  };

  const getAttrValueMap = () => {
    const attrValue: { [key: string]: string } = {};
    const pairs = searchValue.split(' ');
    pairs.map(pair => {
      const splitPair = pair.split(advancedSearchDelimiter);
      if (splitPair.length === 2) {
        attrValue[splitPair[0]] = splitPair[1];
      } else if (splitPair.length === 1) {
        attrValue.haswords = attrValue.hasOwnProperty('haswords')
          ? `${attrValue.haswords} ${splitPair[0]}`
          : splitPair[0];
      }
    });
    return attrValue;
  };

  const getValue = (attribute: string) => {
    const map = getAttrValueMap();
    return map.hasOwnProperty(attribute) ? map[attribute] : '';
  };

  const handleValueChange = (attribute: string, newValue: string, event: React.FormEvent<HTMLInputElement>) => {
    const newMap = getAttrValueMap();
    newMap[attribute] = newValue;
    let updatedValue = '';
    Object.entries(newMap).forEach(([k, v]) => {
      if (v.trim() !== '') {
        if (k !== 'haswords') {
          updatedValue = `${updatedValue} ${k}${advancedSearchDelimiter}${v}`;
        } else {
          updatedValue = `${updatedValue} ${v}`;
        }
      }
    });
    updatedValue = updatedValue.replace(/^\s+/g, '');

    if (onChange) {
      onChange(updatedValue, event);
    }
    setSearchValue(updatedValue);
  };

  const onEnter = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      onSearchHandler(event);
    }
  };

  const buildFormGroups = () => {
    const formGroups = [] as React.ReactNode[];
    attributes.forEach((attribute: string | SearchAttribute, index: number) => {
      const display = typeof attribute === 'string' ? attribute : attribute.display;
      const queryAttr = typeof attribute === 'string' ? attribute : attribute.attr;
      if (index === 0) {
        formGroups.push(
          <FormGroup label={display} fieldId={`${queryAttr}_${index}`} key={`${attribute}_${index}`}>
            <TextInput
              ref={firstAttrRef}
              type="text"
              id={`${queryAttr}_${index}`}
              value={getValue(queryAttr)}
              onChange={(value, evt) => handleValueChange(queryAttr, value, evt)}
            />
          </FormGroup>
        );
      } else {
        formGroups.push(
          <FormGroup label={display} fieldId={`${queryAttr}_${index}`} key={`${attribute}_${index}`}>
            <TextInput
              type="text"
              id={`${queryAttr}_${index}`}
              value={getValue(queryAttr)}
              onChange={(value, evt) => handleValueChange(queryAttr, value, evt)}
            />
          </FormGroup>
        );
      }
    });
    formGroups.push(
      <GenerateId key={'hasWords'}>
        {randomId => (
          <FormGroup label={hasWordsAttrLabel} fieldId={randomId}>
            <TextInput
              type="text"
              id={randomId}
              value={getValue('haswords')}
              onChange={(value, evt) => handleValueChange('haswords', value, evt)}
            />
          </FormGroup>
        )}
      </GenerateId>
    );
    return formGroups;
  };

  return (
    <div className={css(className, styles.searchInput)} ref={searchInputRef} {...props}>
      <InputGroup>
        <div className={css(styles.searchInputBar)}>
          <span className={css(styles.searchInputText)}>
            <span className={css(styles.searchInputIcon)}>
              <SearchIcon />
            </span>
            <input
              ref={searchInputInputRef}
              className={css(styles.searchInputTextInput)}
              value={searchValue}
              placeholder={placeholder}
              aria-label={ariaLabel}
              onKeyDown={onEnter}
              onChange={onChangeHandler}
              disabled={isDisabled}
            />
          </span>
          {value && (
            <span className={css(styles.searchInputUtilities)}>
              {resultsCount && (
                <span className={css(styles.searchInputCount)}>
                  <Badge isRead>{resultsCount}</Badge>
                </span>
              )}
              {!!onNextClick && !!onPreviousClick && (
                <span className={css(styles.searchInputNav)}>
                  <Button
                    variant={ButtonVariant.plain}
                    aria-label="Previous"
                    isDisabled={isDisabled}
                    onClick={onPreviousClick}
                  >
                    <AngleUpIcon />
                  </Button>
                  <Button variant={ButtonVariant.plain} aria-label="Next" isDisabled={isDisabled} onClick={onNextClick}>
                    <AngleDownIcon />
                  </Button>
                </span>
              )}
              {!!onClear && (
                <span className="pf-c-search-input__clear">
                  <Button
                    variant={ButtonVariant.plain}
                    isDisabled={isDisabled}
                    aria-label={resetButtonLabel}
                    onClick={onClear}
                  >
                    <TimesIcon />
                  </Button>
                </span>
              )}
            </span>
          )}
        </div>
        {attributes.length > 0 && (
          <Button
            className={showSearchMenu && 'pf-m-expanded'}
            variant={ButtonVariant.control}
            aria-label={openMenuButtonAriaLabel}
            onClick={onToggle}
            isDisabled={isDisabled}
            aria-expanded={showSearchMenu}
          >
            <CaretDownIcon />
          </Button>
        )}
        {!!onSearch && (
          <Button
            type="submit"
            variant={ButtonVariant.control}
            aria-label={submitSearchButtonLabel}
            onClick={onSearchHandler}
            isDisabled={isDisabled}
          >
            <ArrowRightIcon />
          </Button>
        )}
      </InputGroup>
      {attributes.length > 0 && showSearchMenu && (
        <div className={styles.searchInputMenu}>
          <div className={styles.searchInputMenuBody}>
            <Form>
              {buildFormGroups()}
              {formAdditionalItems ? formAdditionalItems : null}
              <ActionGroup>
                <Button variant="primary" type="submit" onClick={onSearchHandler}>
                  {submitSearchButtonLabel}
                </Button>
                {!!onClear && (
                  <Button variant="link" type="reset" onClick={onClear}>
                    {resetButtonLabel}
                  </Button>
                )}
              </ActionGroup>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};
SearchInputBase.displayName = 'SearchInputBase';

export const SearchInput = React.forwardRef((props: SearchInputProps, ref: React.Ref<HTMLInputElement>) => (
  <SearchInputBase {...props} innerRef={ref as React.MutableRefObject<any>} />
));
SearchInput.displayName = 'SearchInput';
