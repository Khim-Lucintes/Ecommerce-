import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProductCard({ product }) {
    const {
        product_id,
        product_name,
        price,
        stock,
        image_url,
        store_name,
        category_name,
        average_rating,
        review_count,
        sold_count,
    } = product;

    const formattedPrice = Number(price).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    return (
        <Link href={`/products/${product_id}`} className="group outline-none">
            <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {/* Product image */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                    {image_url ? (
                        <img
                            src={image_url}
                            alt={product_name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Out of stock badge */}
                    {stock === 0 && (
                        <Badge variant="destructive" className="absolute top-2 left-2">
                            Out of stock
                        </Badge>
                    )}
                </div>

                {/* Info */}
                <CardContent className="flex flex-1 flex-col p-4 gap-1.5">
                    <p className="text-xs text-primary font-medium truncate">{category_name}</p>
                    <h3 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {product_name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{store_name}</p>
                    <div className="mt-auto pt-2">
                        <p className="text-base font-bold text-primary">{formattedPrice}</p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                                <span className="text-amber-400">★</span>
                                <span>{average_rating ? Number(average_rating).toFixed(1) : '0.0'}</span>
                                <span>({review_count || 0})</span>
                            </div>
                            <span>{sold_count || 0} sold</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
