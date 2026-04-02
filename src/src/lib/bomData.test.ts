import { describe, it, expect } from 'vitest';
import { isDescendant, BOMNode } from './bomData';

describe('isDescendant', () => {
  const mockTree: BOMNode[] = [
    {
      id: 'root',
      name: 'Root',
      type: 'assembly',
      revision: 'A',
      tags: [],
      quantity: 1,
      findNumber: '1',
      unitOfMeasure: 'EA',
      children: [
        {
          id: 'child1',
          name: 'Child 1',
          type: 'sub-assembly',
          revision: 'A',
          tags: [],
          quantity: 1,
          findNumber: '10',
          unitOfMeasure: 'EA',
          children: [
            {
              id: 'grandchild1',
              name: 'Grandchild 1',
              type: 'part',
              revision: 'A',
              tags: [],
              quantity: 1,
              findNumber: '10',
              unitOfMeasure: 'EA',
              children: []
            }
          ]
        },
        {
          id: 'child2',
          name: 'Child 2',
          type: 'part',
          revision: 'A',
          tags: [],
          quantity: 1,
          findNumber: '20',
          unitOfMeasure: 'EA',
          children: []
        }
      ]
    }
  ];

  it('returns true for a direct child', () => {
    expect(isDescendant(mockTree, 'root', 'child1')).toBe(true);
    expect(isDescendant(mockTree, 'root', 'child2')).toBe(true);
  });

  it('returns true for a nested descendant', () => {
    expect(isDescendant(mockTree, 'root', 'grandchild1')).toBe(true);
    expect(isDescendant(mockTree, 'child1', 'grandchild1')).toBe(true);
  });

  it('returns true if sourceId equals targetId', () => {
    expect(isDescendant(mockTree, 'root', 'root')).toBe(true);
    expect(isDescendant(mockTree, 'child1', 'child1')).toBe(true);
  });

  it('returns false if sourceId does not exist', () => {
    expect(isDescendant(mockTree, 'nonexistent', 'child1')).toBe(false);
  });

  it('returns false if targetId is not a descendant of sourceId', () => {
    expect(isDescendant(mockTree, 'child2', 'child1')).toBe(false);
    expect(isDescendant(mockTree, 'child1', 'child2')).toBe(false);
  });

  it('returns false if targetId is an ancestor of sourceId', () => {
    expect(isDescendant(mockTree, 'child1', 'root')).toBe(false);
    expect(isDescendant(mockTree, 'grandchild1', 'root')).toBe(false);
  });

  it('returns false if targetId does not exist in the tree', () => {
    expect(isDescendant(mockTree, 'root', 'nonexistent')).toBe(false);
  });
});
