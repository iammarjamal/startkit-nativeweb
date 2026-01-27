<script setup lang="ts">
import type { DateRange } from 'reka-ui'
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from '@internationalized/date'
import { CalendarIcon, X } from 'lucide-vue-next'
import { type Ref, ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue?: DateRange | null
  placeholder?: string
  class?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: DateRange | null]
}>()

const { locale, t } = useI18n()
const isRtl = locale.value === 'ar';

const UNIFIED_LOCALE = isRtl ? 'ar-SA-u-ca-iso8601-nu-latn' : 'en-US';

const df = new DateFormatter(UNIFIED_LOCALE, {
  dateStyle: 'medium',
  calendar: 'gregory',
  numberingSystem: 'latn'
})

const value = computed({
  get: () => {
    if (props.modelValue?.start && props.modelValue?.end) {
      return {
        start: props.modelValue.start.subtract({ days: 1 }),
        end: props.modelValue.end.subtract({ days: 1 })
      };
    }
    return props.modelValue;
  },
  set: (val) => {
    // When setting the value (from RangeCalendar's update:model-value event),
    // first apply the start/end date swap logic, then adjust the end date
    // to be exclusive (start of the next day) before emitting.
    if (val?.start && val?.end) {
      let adjustedVal = { ...val }; // Create a copy to avoid mutating the original object

      // Validate that end date is not before start date and swap if necessary
      if (adjustedVal.end.compare(adjustedVal.start) < 0) {
        const temp = adjustedVal.start;
        adjustedVal.start = adjustedVal.end;
        adjustedVal.end = temp;
      }

      emit('update:modelValue', {
        start: adjustedVal.start.add({ days: 1 }),
        end: adjustedVal.end.add({ days: 1 })
      });
    } else {
      emit('update:modelValue', val);
    }
  }
});

// Clear date range function
const clearValue = (event: Event) => {
  event.stopPropagation()
  emit('update:modelValue', null)
}

const displayValue = computed(() => {
  // 'value.value' here will already be adjusted by the 'get' method of the computed property
  // to show the correct selected date to the user.
  if (!value.value?.start) {
    return props.placeholder || (locale.value === 'ar' ? 'اختر نطاق التاريخ' : 'Pick a date range')
  }

  try {
    const startDate = value.value.start.toDate(getLocalTimeZone())

    if (value.value.end) {
      const endDate = value.value.end.toDate(getLocalTimeZone())
      return `${df.format(startDate)} - ${df.format(endDate)}`
    }

    return df.format(startDate)
  } catch (error) {
    console.warn('Date formatting error:', error)
    return props.placeholder || (locale.value === 'ar' ? 'تاريخ غير صحيح' : 'Invalid date')
  }
})

const handleDateRangeUpdate = (newValue: DateRange | null) => {
  value.value = newValue;
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn(
          'w-full justify-start text-start font-normal',
          !value && 'text-muted-foreground',
          props.class
        )"
        :disabled="disabled"
      >
        <CalendarIcon v-if="!value" class="me-1 h-4 w-4" />
        <span
          v-else
          class="ms-auto cursor-pointer hover:bg-muted rounded p-1 transition-colors"
          @click="clearValue"
          :title="$t('clear_date')"
        >
          <X class="h-3 w-3" />
        </span>
        <span class="flex-1 truncate">{{ displayValue }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent
      class="w-auto p-0"
      :align="locale === 'ar' ? 'end' : 'start'"
      :side-offset="4"
    >
      <RangeCalendar
        :model-value="value"
        @update:model-value="handleDateRangeUpdate"
        :initial-focus="true"
        :number-of-months="1"
        :locale="UNIFIED_LOCALE"
        calendar="gregory"
        numbering-system="latn"
        :week-starts-on="locale === 'ar' ? 6 : 0"
        :fixed-weeks="true"
        :dir="locale === 'ar' ? 'rtl' : 'ltr'"
        class="rounded-md border"
      />
    </PopoverContent>
  </Popover>
</template>

<i18n lang="json">
    {
      "en": {
        "pick_range": "Pick a date range",
        "clear_date": "Clear date",
        "invalid_date": "Invalid date"
      },
      "ar": {
        "pick_range": "اختر نطاق التاريخ",
        "clear_date": "مسح التاريخ",
        "invalid_date": "تاريخ غير صحيح"
      }
    }
</i18n>
