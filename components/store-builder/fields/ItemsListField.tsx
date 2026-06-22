'use client'

import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import TextField from './TextField'
import TextareaField from './TextareaField'
import ColorField from './ColorField'
import ToggleField from './ToggleField'
import SliderField from './SliderField'
import SelectField from './SelectField'
import ImageUploadField from './ImageUploadField'

export type FieldSchema = {
  type: 'text' | 'textarea' | 'color' | 'toggle' | 'slider' | 'select' | 'image'
  id: string
  label: string
  options?: string[]
  min?: number
  max?: number
}

interface ItemsListFieldProps {
  label: string
  value: any[]
  onChange: (val: any[]) => void
  itemSchema: FieldSchema[]
}

export default function ItemsListField({ label, value = [], onChange, itemSchema }: ItemsListFieldProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const items = Array.isArray(value) ? value : []

  const handleAddItem = () => {
    const newItem: any = { id: Date.now().toString() }
    // Initialize default values based on schema
    itemSchema.forEach(field => {
      if (field.type === 'toggle') newItem[field.id] = false
      else if (field.type === 'slider') newItem[field.id] = field.min || 0
      else if (field.type === 'select') newItem[field.id] = field.options?.[0] || ''
      else newItem[field.id] = ''
    })
    onChange([...items, newItem])
    setExpandedId(newItem.id)
  }

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(items.filter(item => item.id !== id))
  }

  const handleUpdateItem = (id: string, fieldId: string, newValue: any) => {
    onChange(items.map(item => item.id === id ? { ...item, [fieldId]: newValue } : item))
  }

  const moveItem = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation()
    const newItems = [...items]
    if (direction === 'up' && index > 0) {
      const temp = newItems[index]
      newItems[index] = newItems[index - 1]
      newItems[index - 1] = temp
      onChange(newItems)
    } else if (direction === 'down' && index < newItems.length - 1) {
      const temp = newItems[index]
      newItems[index] = newItems[index + 1]
      newItems[index + 1] = temp
      onChange(newItems)
    }
  }

  const renderField = (field: FieldSchema, item: any) => {
    const commonProps = {
      label: field.label,
      value: item[field.id],
      onChange: (val: any) => handleUpdateItem(item.id, field.id, val)
    }

    switch (field.type) {
      case 'text': return <TextField key={field.id} {...commonProps} />
      case 'textarea': return <TextareaField key={field.id} {...commonProps} />
      case 'color': return <ColorField key={field.id} {...commonProps} />
      case 'toggle': return <ToggleField key={field.id} {...commonProps} />
      case 'slider': return <SliderField key={field.id} {...commonProps} min={field.min} max={field.max} />
      case 'select': return <SelectField key={field.id} {...commonProps} options={field.options || []} />
      case 'image': return <ImageUploadField key={field.id} {...commonProps} />
      default: return null
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
      
      <div className="space-y-2 mb-3">
        {items.map((item, index) => {
          const isExpanded = expandedId === item.id
          // Try to find a good title (first text field)
          const titleField = itemSchema.find(f => f.type === 'text')
          const itemTitle = titleField ? item[titleField.id] : `Item ${index + 1}`

          return (
            <div key={item.id || index} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div 
                className="flex items-center p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex flex-col gap-1 mr-2 px-1">
                  <button onClick={(e) => moveItem(index, 'up', e)} disabled={index === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={(e) => moveItem(index, 'down', e)} disabled={index === items.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                    <ChevronDown size={14} />
                  </button>
                </div>
                <span className="flex-1 text-sm font-medium truncate">{itemTitle || `Item ${index + 1}`}</span>
                
                <button 
                  onClick={(e) => handleDeleteItem(item.id, e)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              {isExpanded && (
                <div className="p-3 border-t border-gray-200 bg-white space-y-1">
                  {itemSchema.map(field => renderField(field, item))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={handleAddItem}
        className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 dashed"
      >
        <Plus size={16} /> Ajouter un élément
      </button>
    </div>
  )
}
