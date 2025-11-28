// components/teacher/GroupSelector.tsx

'use client';

import { useState, useEffect } from 'react';
import { getToken, getTeacherId } from '@/lib/auth';

interface Group {
  id: string;
  name: string;
  level: { name: string };
}

interface GroupSelectorProps {
  onSelect: (groupId: string) => void;
  selectedGroupId?: string;
}

export default function GroupSelector({ onSelect, selectedGroupId }: GroupSelectorProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const teacherId = getTeacherId();
      const res = await fetch(
        `http://localhost:3001/api/groups?teacherId=${teacherId}`,
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      setGroups(data.data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading groups...</div>;

  return (
    <select
      value={selectedGroupId || ''}
      onChange={(e) => onSelect(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select a group</option>
      {groups.map(group => (
        <option key={group.id} value={group.id}>
          {group.name} ({group.level.name})
        </option>
      ))}
    </select>
  );
}