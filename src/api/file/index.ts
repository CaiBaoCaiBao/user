import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface UploadResponse {
    url: string
    filename: string
    size: number
    mimeType: string
}

export interface UploadProgress {
    loaded: number
    total: number
    percent: number
}

// ==================== 文件上传 API ====================

const FileApi = {
    /**
     * 上传单个文件
     */
    uploadFile: async (file: File, onProgress?: (progress: UploadProgress) => void) => {
        const formData = new FormData()
        formData.append('file', file)

        return request.post<{ data: UploadResponse }>('/file/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percent,
                    })
                }
            },
        })
    },

    /**
     * 上传多个文件
     */
    uploadFiles: async (files: File[], onProgress?: (progress: UploadProgress) => void) => {
        const formData = new FormData()
        files.forEach((file) => {
            formData.append('files', file)
        })

        return request.post<{ data: UploadResponse[] }>('/file/api/upload/batch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percent,
                    })
                }
            },
        })
    },

    /**
     * 上传图片（自动压缩）
     */
    uploadImage: async (file: File, quality = 0.8, onProgress?: (progress: UploadProgress) => void) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('quality', quality.toString())

        return request.post<{ data: UploadResponse }>('/file/api/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percent,
                    })
                }
            },
        })
    },

    /**
     * 删除文件
     */
    deleteFile: async (url: string) => {
        return request.delete('/file/api/delete', { data: { url } })
    },
}

export default FileApi
