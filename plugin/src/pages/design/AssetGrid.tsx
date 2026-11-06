import { Codicon } from '@hermes/plugin-sdk'
import { assetSrc, type DesignAsset } from '../../api/design'
import { isImage } from './labels'

export function AssetGrid({
  assets,
  onOpen,
  empty = '还没有素材'
}: {
  assets: DesignAsset[]
  onOpen?: (asset: DesignAsset) => void
  empty?: string
}) {
  if (assets.length === 0) {
    return <p className="text-xs text-(--ui-text-tertiary)">{empty}</p>
  }
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
      {assets.map(asset => {
        const size = asset.width && asset.height ? `${asset.width}×${asset.height}` : asset.mime || '文件'
        return (
          <li key={asset.id} className="min-w-0">
            <button
              type="button"
              onClick={() => onOpen?.(asset)}
              className="flex w-full min-w-0 flex-col gap-1 rounded-md p-1 text-left hover:bg-(--ui-bg-quinary)"
            >
              <span className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)">
                {isImage(asset.mime) ? (
                  <img src={assetSrc(asset.url)} alt="" className="max-h-full max-w-full object-contain" />
                ) : (
                  <Codicon name="library" size="1.25rem" />
                )}
              </span>
              <span className="truncate text-xs">{asset.file_name}</span>
              <span className="truncate text-[0.6875rem] text-(--ui-text-tertiary)">{size}</span>
              {asset.tags.length > 0 ? (
                <span className="truncate text-[0.6875rem] text-(--ui-text-tertiary)">{asset.tags.join('、')}</span>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
