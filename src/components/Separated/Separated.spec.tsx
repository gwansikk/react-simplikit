import { render, screen } from '@testing-library/react';

import { Separated } from './Separated.tsx';

describe('Separated', () => {
  it('should render children by separator', () => {
    const CHILDREN_COUNT = 3;
    const separator = <span data-testid="separator">|</span>;
    const children = Array.from({ length: CHILDREN_COUNT }, (_, i) => (
      <div key={i} data-testid={`child-${i}`}>
        Item {i}
      </div>
    ));

    render(<Separated by={separator}>{children}</Separated>);

    for (let i = 0; i < CHILDREN_COUNT; i++) {
      expect(screen.getByTestId(`child-${i}`)).toBeInTheDocument();
    }

    expect(screen.getAllByTestId('separator')).toHaveLength(CHILDREN_COUNT - 1);
  });

  it('should not render separator by single child', () => {
    const separator = <span data-testid="separator">|</span>;
    const child = <div data-testid="single-child">Single Item</div>;

    render(<Separated by={separator}>{child}</Separated>);

    expect(screen.getByTestId('single-child')).toBeInTheDocument();
    expect(screen.queryByTestId('separator')).not.toBeInTheDocument();
  });

  it('should not render separator by empty children', () => {
    const separator = <span data-testid="separator">|</span>;

    render(
      <Separated by={separator}>
        <></>
      </Separated>
    );

    expect(screen.queryByTestId('separator')).not.toBeInTheDocument();
  });

  it('should filter out non-valid elements', () => {
    const separator = <span data-testid="separator">|</span>;
    const children = [
      <div key="valid" data-testid="valid">
        Valid
      </div>,
      null,
      undefined,
      false,
      'text',
    ];

    render(<Separated by={separator}>{children}</Separated>);

    expect(screen.getByTestId('valid')).toBeInTheDocument();
    expect(screen.queryByTestId('separator')).not.toBeInTheDocument();
  });
});
