export type NavSport = {
  slug: string
  name: string
  tagline: string | null
  cardImage: string
  isSubBrand: boolean
  categories: { slug: string; name: string }[]
}
