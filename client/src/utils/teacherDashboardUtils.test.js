import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTeacherDashboardData } from './teacherDashboardUtils.js';

test('buildTeacherDashboardData computes real dashboard metrics from courses and doubts', () => {
  const courses = [
    {
      _id: 'c1',
      title: 'JEE Physics',
      category: 'JEE',
      totalStudents: 20,
      totalLessons: 10,
      price: 1000,
      discountPrice: 800,
      rating: 4.8,
    },
    {
      _id: 'c2',
      title: 'NEET Biology',
      category: 'NEET',
      totalStudents: 10,
      totalLessons: 5,
      price: 1200,
      discountPrice: 900,
      rating: 4.6,
    },
  ];

  const doubts = [
    { _id: 'd1', question: 'Why does this happen?', student: { name: 'Aarav' }, course: { title: 'JEE Physics' }, createdAt: '2026-06-13T10:00:00.000Z' },
  ];

  const result = buildTeacherDashboardData(courses, doubts);

  assert.equal(result.stats.totalStudents, 30);
  assert.equal(result.stats.activeCourses, 2);
  assert.equal(result.stats.totalLectures, 15);
  assert.equal(result.stats.revenue, 800 * 20 + 900 * 10);
  assert.equal(result.recentDoubts.length, 1);
  assert.equal(result.recentDoubts[0].studentName, 'Aarav');
  assert.equal(result.courseDistribution.length, 2);
});
