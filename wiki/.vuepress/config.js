module.exports = {
  title: 'Type Client Framework',
  description: 'Just playing around',
  base: '/TypeClient/',
  dest: 'docs',
  themeConfig: {
    sidebar: 'auto',
    nav: [
      { text: '首页', link: '/' },
      { text: '介绍', link: '/zh/guide' },
      { text: '核心', link: '/zh/core' },
      { text: '生态', items: [
        {text: 'React driver support', link: '/zh/react'},
        {text: 'Vue driver support', link: '/zh/vue'}
      ] },
      { text: 'Github', link: 'https://github.com/flowxjs/TypeClient' },
    ]
  }
}