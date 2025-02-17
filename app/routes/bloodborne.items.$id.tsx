export default function ItemPage() {
  // const {} =

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto">
        <div
          className="bg-[#1a1a1a] p-8 border-2 border-[#c5a572] 
                      shadow-[0_0_15px_rgba(197,165,114,0.2)]"
        >
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-[#2a2a2a] p-2 border border-[#c5a572]">
              <img
                src={`/icons/${
                  item.expansion ? '/Shadow of the Erdtree DLC/' : ''
                }${itemLikeToFolderName(item)}/${item.title
                  ?.replace("'", '_')
                  .replace(/<[^>]*>?/gm, '')}
                    .png`}
                alt={item.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-3 py-1 text-xs font-medieval tracking-wider
                                bg-[#2a2a2a] text-[#c5a572] border border-[#c5a572]"
                >
                  {item.itemSubType || item.itemType}
                </span>
                <span className="text-sm text-[#a89782]">
                  {item.game} • {item.expansion}
                </span>
              </div>

              <h1
                className="text-3xl font-medieval tracking-wide text-[#c5a572] mb-4"
                dangerouslySetInnerHTML={{ __html: item.title }}
              />

              <div className="prose prose-invert prose-gold">
                <p
                  className="text-[#a89782] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />

                {item.description && (
                  <div className="mt-6">
                    <h2 className="text-xl font-medieval text-[#c5a572] mb-2">
                      Description
                    </h2>
                    <p
                      className="text-[#a89782]"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </div>
                )}

                {/* Add more item details as needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
