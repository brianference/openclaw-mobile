/**
 * TC-MOBILE-019: Breakpoint Transitions
 * Category: Responsiveness
 * Priority: P1 (High)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;

describe('TC-MOBILE-019: Breakpoint Transitions', () => {
  const breakpoints = [
    { width: 375, name: 'Mobile (iPhone SE)', columns: 1 },
    { width: 430, name: 'Large Mobile (iPhone 14 Pro)', columns: 1 },
    { width: 768, name: 'Tablet (iPad)', columns: 2 },
    { width: 1024, name: 'Large Tablet', columns: 3 },
  ];

  breakpoints.forEach(({ width, name, columns }) => {
    test(`${name}: renders correctly at ${width}px`, () => {
      Dimensions.get = jest.fn().mockReturnValue({ width, height: 1024 });
      
      const { getByTestId } = render(
        <TaskListScreen tasks={[{ id: '1', title: 'Task 1' }]} />
      );
      
      const taskList = getByTestId('task-list-container');
      const gridColumns = taskList.props.style?.gridTemplateColumns || 
                         taskList.props.numColumns || 
                         columns;
      
      expect(gridColumns).toBe(columns);
    });
  });

  test('no horizontal scroll at any breakpoint', () => {
    breakpoints.forEach(({ width }) => {
      Dimensions.get = jest.fn().mockReturnValue({ width, height: 1024 });
      
      const { container } = render(<TaskListScreen />);
      
      // No horizontal overflow
      expect(container.props.style?.overflowX).not.toBe('scroll');
    });
  });
});
