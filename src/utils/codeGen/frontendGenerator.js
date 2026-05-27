const { toCamelCase, toPascalCase } = require('./dbReader');

const generateApiCode = (table, businessName) => {
  const moduleName = table.moduleName || 'system';
  const functionName = table.functionName || businessName;

  return `import request from '@/utils/request'

export function list${toPascalCase(businessName)}(query) {
  return request({
    url: '/${moduleName}/${businessName}/list',
    method: 'get',
    params: query
  })
}

export function get${toPascalCase(businessName)}(${businessName}Id) {
  return request({
    url: '/${moduleName}/${businessName}/' + ${businessName}Id,
    method: 'get'
  })
}

export function add${toPascalCase(businessName)}(data) {
  return request({
    url: '/${moduleName}/${businessName}',
    method: 'post',
    data: data
  })
}

export function update${toPascalCase(businessName)}(data) {
  return request({
    url: '/${moduleName}/${businessName}',
    method: 'put',
    data: data
  })
}

export function del${toPascalCase(businessName)}(${businessName}Ids) {
  return request({
    url: '/${moduleName}/${businessName}/' + ${businessName}Ids,
    method: 'delete'
  })
}
`;
};

const generateVueIndexCode = (table, columns, businessName) => {
  const tableComment = table.tableComment || table.tableName;
  const moduleName = table.moduleName || 'system';
  const functionName = table.functionName || businessName;
  const pkColumn = columns.find(c => c.column_key === 'PRI');
  const pkField = pkColumn ? toCamelCase(pkColumn.column_name) : 'id';
  const queryColumns = columns.filter(c => c.is_query === '1').slice(0, 4);
  const listColumns = columns.filter(c => c.is_list === '1').slice(0, 8);

  return `<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
${queryColumns.map(col => {
    const field = toCamelCase(col.column_name);
    const label = col.column_comment || field;
    if (col.html_type === 'select' || col.dict_type) {
      return `      <el-form-item label="${label}" prop="${field}">
        <el-select v-model="queryParams.${field}" placeholder="请选择${label}" clearable>
          <el-option v-for="dict in ${col.dict_type || 'status'}" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>`;
    }
    return `      <el-form-item label="${label}" prop="${field}">
        <el-input v-model="queryParams.${field}" placeholder="请输入${label}" clearable @keyup.enter="handleQuery" />
      </el-form-item>`;
  }).join('\n')}
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['${moduleName}:${businessName}:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :single="true" :disabled="single" @click="handleUpdate()" v-hasPermi="['${moduleName}:${businessName}:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['${moduleName}:${businessName}:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['${moduleName}:${businessName}:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="${businessName}List" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
${listColumns.map(col => {
    const field = toCamelCase(col.column_name);
    const label = col.column_comment || field;
    if (col.dict_type) {
      return `      <el-table-column label="${label}" align="center" prop="${field}">
        <template #default="scope">
          <dict-tag :options="${col.dict_type}" :value="scope.row.${field}" />
        </template>
      </el-table-column>`;
    }
    return `      <el-table-column label="${label}" align="center" prop="${field}" />`;
  }).join('\n')}
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['${moduleName}:${businessName}:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['${moduleName}:${businessName}:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="${businessName}Ref" :model="form" :rules="rules" label-width="80px">
${columns.filter(c => c.is_edit === '1' && c.column_key !== 'PRI').map(col => {
    const field = toCamelCase(col.column_name);
    const label = col.column_comment || field;
    const required = col.is_required === '1';
    if (col.html_type === 'select' || col.dict_type) {
        return `        <el-form-item label="${label}" prop="${field}">
          <el-select v-model="form.${field}" placeholder="请选择${label}">
            <el-option v-for="dict in ${col.dict_type || 'status'}" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>`;
    }
    if (col.html_type === 'textarea') {
        return `        <el-form-item label="${label}" prop="${field}">
          <el-input v-model="form.${field}" type="textarea" placeholder="请输入${label}" />
        </el-form-item>`;
    }
    if (col.html_type === 'datetime') {
        return `        <el-form-item label="${label}" prop="${field}">
          <el-date-picker v-model="form.${field}" type="datetime" placeholder="选择${label}" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>`;
    }
    return `        <el-form-item label="${label}" prop="${field}">
          <el-input v-model="form.${field}" placeholder="请输入${label}" />
        </el-form-item>`;
  }).join('\n')}
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { list${toPascalCase(businessName)}, get${toPascalCase(businessName)}, add${toPascalCase(businessName)}, update${toPascalCase(businessName)}, del${toPascalCase(businessName)} } from '@/api/${moduleName}/${businessName}'

const { proxy } = getCurrentInstance()

const ${businessName}List = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
${queryColumns.map(col => `    ${toCamelCase(col.column_name)}: undefined`).join(',\n')}
  },
  rules: {
${columns.filter(c => c.is_required === '1' && c.is_edit === '1' && c.column_key !== 'PRI').map(col => `    ${toCamelCase(col.column_name)}: [{ required: true, message: '${col.column_comment || toCamelCase(col.column_name)}不能为空', trigger: 'blur' }]`).join(',\n')}
  }
})

const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  list${toPascalCase(businessName)}(queryParams.value).then(response => {
    ${businessName}List.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.${pkField})
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function reset() {
  form.value = {
${columns.filter(c => c.is_edit === '1' && c.column_key !== 'PRI').map(col => `    ${toCamelCase(col.column_name)}: undefined`).join(',\n')}
  }
  proxy.resetForm('${businessName}Ref')
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '添加${tableComment}'
}

function handleUpdate(row) {
  reset()
  const ${pkField} = row.${pkField} || ids.value[0]
  get${toPascalCase(businessName)}(${pkField}).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改${tableComment}'
  })
}

function submitForm() {
  proxy.$refs['${businessName}Ref'].validate(valid => {
    if (valid) {
      if (form.value.${pkField}) {
        update${toPascalCase(businessName)}(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        add${toPascalCase(businessName)}(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const ${pkField}s = row.${pkField} || ids.value
  proxy.$modal.confirm('是否确认删除编号为"' + ${pkField}s + '"的数据项？').then(function () {
    return del${toPascalCase(businessName)}(${pkField}s)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

function handleExport() {
  proxy.download('${moduleName}/${businessName}/export', { ...queryParams.value }, '${businessName}_' + new Date().getTime() + '.xlsx')
}

getList()
</script>
`;
};

module.exports = {
  generateApiCode,
  generateVueIndexCode,
};
