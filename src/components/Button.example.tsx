/**
 * Button Component - Usage Examples
 *
 * This file demonstrates all variants and use cases of the Button component.
 * DO NOT import this file in production code - it's for reference only.
 */

import { View, StyleSheet } from 'react-native';
import Button from './Button';

/**
 * Example: Basic Usage
 */
export function BasicButtonExample() {
  return (
    <View style={styles.container}>
      <Button onPress={() => console.log('Pressed')}>
        Save Changes
      </Button>
    </View>
  );
}

/**
 * Example: All Variants
 */
export function VariantExamples() {
  return (
    <View style={styles.container}>
      {/* Primary Button (default) */}
      <Button variant="primary" onPress={() => {}}>
        Primary Action
      </Button>

      {/* Accent Button */}
      <Button variant="accent" onPress={() => {}}>
        Complete Task
      </Button>

      {/* Secondary Button */}
      <Button variant="secondary" onPress={() => {}}>
        Cancel
      </Button>

      {/* Ghost Button */}
      <Button variant="ghost" onPress={() => {}}>
        Learn More
      </Button>
    </View>
  );
}

/**
 * Example: All Sizes
 */
export function SizeExamples() {
  return (
    <View style={styles.container}>
      <Button size="small" onPress={() => {}}>
        Small Button
      </Button>

      <Button size="medium" onPress={() => {}}>
        Medium Button
      </Button>

      <Button size="large" onPress={() => {}}>
        Large Button
      </Button>
    </View>
  );
}

/**
 * Example: With Icons
 */
export function IconExamples() {
  return (
    <View style={styles.container}>
      {/* Icon on left (default) */}
      <Button icon="checkmark-circle" onPress={() => {}}>
        Save
      </Button>

      {/* Icon on right */}
      <Button icon="arrow-forward" iconPosition="right" onPress={() => {}}>
        Next
      </Button>

      {/* Icon only (use empty string for children) */}
      <Button icon="add" onPress={() => {}}>
        Add Task
      </Button>
    </View>
  );
}

/**
 * Example: States
 */
export function StateExamples() {
  return (
    <View style={styles.container}>
      {/* Normal state */}
      <Button onPress={() => {}}>
        Normal
      </Button>

      {/* Disabled state */}
      <Button disabled onPress={() => {}}>
        Disabled
      </Button>

      {/* Loading state */}
      <Button loading onPress={() => {}}>
        Saving...
      </Button>
    </View>
  );
}

/**
 * Example: Form Submission
 */
export function FormExample() {
  const handleSubmit = async () => {
    // Submit form
    console.log('Submitting form...');
  };

  return (
    <View style={styles.formActions}>
      <Button variant="secondary" onPress={() => console.log('Cancel')}>
        Cancel
      </Button>

      <Button
        variant="primary"
        icon="checkmark"
        onPress={handleSubmit}
      >
        Create Task
      </Button>
    </View>
  );
}

/**
 * Example: Delete Action
 */
export function DeleteExample() {
  const handleDelete = () => {
    console.log('Deleting...');
  };

  return (
    <Button
      variant="accent"
      icon="trash"
      onPress={handleDelete}
      textStyle={{ color: '#ef4444' }} // Override text color for danger action
    >
      Delete Task
    </Button>
  );
}

/**
 * Example: Full-Width Button
 */
export function FullWidthExample() {
  return (
    <Button
      onPress={() => {}}
      style={{ width: '100%' }}
    >
      Continue
    </Button>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 24,
  },
});
